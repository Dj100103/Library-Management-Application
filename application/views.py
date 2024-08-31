from flask import current_app as app, jsonify, render_template, request, Response, send_file
from .models import db, Ebook, User, BooksIssued, Section, Requests, Rating
from .sec import datastore
from werkzeug.security import check_password_hash
from datetime import timedelta
from flask_security import auth_required, roles_required
import pandas as pd
from celery.result import AsyncResult
from .tasks import get_books_issued_csv, user_records, get_user_data_csv, daily_reminder_task
from .Cache import cache
from werkzeug.security import generate_password_hash

@app.route("/")
def home():
    return render_template('index.html')


@app.route("/user_login", methods=["GET", "POST"])
def user_login():
    if request.method=="POST":
        data= request.get_json()
        email= data.get('email')
        if not email:
            return jsonify({'message':'not found'}), 400
            
        user=datastore.find_user(email=email)
        if not user:
            return jsonify({'message': 'user not found'}), 404
        if user.active==True:
            if check_password_hash(user.password, data.get("password")):
                return jsonify({'auth_token':user.get_auth_token(), 'email':email, 'role':user.roles[0].name, 'user_id': user.id}), 200
            else:
                return jsonify({"message": "wrong password, try again"}), 404
        return jsonify({"message": "you dont have permission"}), 404


@app.route("/register", methods=["POST"])
@cache.cached(timeout=300, key_prefix='register')
def register():
    data=request.get_json()
    if not datastore.find_user(email=data.get('email')):
        datastore.create_user(email=data.get('email'), password=generate_password_hash(data.get('password')), username=data.get('username'), roles=["User"])
        db.session.commit()
        return jsonify({"message": "User created successfully"}), 200
    else:
        return jsonify({"message": "User already exists"}), 404


@app.route("/user_details", methods=["GET", "POST"])
@auth_required("token")
def user_details():
    if request.method=="POST":
        data=request.get_json()
        user_id=data.get('user_id')
        user=User.query.get(int(user_id))
        return jsonify({"user_id":user.id, "username":user.username, "email":user.email}), 200

@app.route("/update_profile", methods=["POST"])
@auth_required('token')
@roles_required('User')
def update_user():
    data=request.get_json()
    user_id=data.get('user_id')
    username=data.get('username')
    email=data.get('email')
    user=User.query.get(int(user_id))
    user.username=username
    user.email=email
    db.session.commit()
    return jsonify({"message": "updated successfully"}), 200
    


@app.route("/all_books", methods=["GET"])
@auth_required("token")
def books():
    all_books=Ebook.query.all()
    if not all_books:
        return jsonify({"message": "No Books Found"}), 404
    books=[]
    for book in all_books:
        issued_users=[]
        for x in book.books_issued:
            if x.returned!=True:
                issued_users.append(str(x.user_id))
        books.append({
            "id" : book.id,
            "name" : book.name,
            "author": book.author,
            "content": book.content,
            "rating": book.average_rating,
            "issued_users": issued_users
        })
    return jsonify({"books": books}), 200


@app.route("/user_books/<id>")
@auth_required("token")
def user_books(id):
    # Fetch the user by ID
    user_id = int(id)
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({"message": "User not found"}), 404
    
    # Query for books issued to the user
    issued_books = BooksIssued.query.filter_by(user_id=user_id).filter_by(returned=False).all()
    
    if not issued_books:
        return jsonify({"message": "No books issued to this user"}), 404
    
    # Retrieve the details of the books
    books = []
    for issued in issued_books:
        book = Ebook.query.get(issued.book_id)
        if book:
            books.append({
                "id": book.id,
                "name": book.name,
                "author": book.author,
                "content": book.content,
                "rating": book.average_rating,
                "return_date":issued.return_date
            })
    
    return jsonify({"issued_books": books}), 200


@app.get("/books/issued/<book_id>")
@auth_required("token")
@roles_required("Librarian")
def issued_to(book_id):
    users=[]
    book = Ebook.query.get(int(book_id))
    books_issued_entries = book.books_issued
    print(books_issued_entries)
    if not books_issued_entries:
        return jsonify({"message":"No Issues"}), 404
    for entry in books_issued_entries:
        if entry.returned!=True:
            user = entry.user
            users.append({
                'email': user.email,
                'id': user.id,
                'return_date': entry.return_date  # Add return_date here
            })
    return jsonify({'users':users}), 200


@app.route("/requests/by_user/<user_id>")
@auth_required("token")
def requests_by(user_id):
    user=User.query.get(int(user_id))
    if not user:
        return jsonify({"message":"User Not found"}), 404
    requests=Requests.query.filter_by(user_id=int(user_id)).filter_by(status="Pending").all()
    if not requests:
        return jsonify({"message":"No requests found"}), 404
    req=[]
    for x in requests:
        req.append(x.book_id)
    return jsonify({"data":req}), 200


@app.route("/request_book/<book_id>/<user_id>")
@auth_required("token")
@roles_required("User")
def req_book(book_id, user_id):
    user=User.query.get(int(user_id))
    if not user:
        return jsonify({"message": "User doesnt exist"}), 404
    book=Ebook.query.get(int(book_id))
    if not book:
        return jsonify({"message": "book not found"}), 404
    try:
        request_book=Requests(user_id=int(user_id), book_id=int(book_id))
        # issued_record = BooksIssued(book_id=int(book_id), user_id=int(user_id))
        # db.session.add(issued_record)
        # db.session.commit()
        # issued_record.return_date=issued_record.issue_date + timedelta(days=5)
        db.session.add(request_book)
        db.session.commit()
    except:
        return jsonify({"message": "couldn't add now, try again"})
    return jsonify({"message": "Request Sent"}), 200


@app.route("/revoke/<user_id>/<book_id>")
@auth_required("token")
def revoke(user_id, book_id):
    user=User.query.get(int(user_id))
    if not user:
        return jsonify({"message": "User doesnt exist"}), 404
    book=Ebook.query.get(int(book_id))
    if not book:
        return jsonify({"message": "book not found"}), 404
    
    issue_record=BooksIssued.query.filter_by(user_id=user_id, book_id=book_id).filter_by(returned=False).one()
    try:
        issue_record.returned=True
        db.session.commit()
        return jsonify({'message':'record deleted successfully'}), 200
    except:
        return jsonify({'message': 'not deleted'}), 404
    

@app.route("/sections", methods=["GET", "POST", "DELETE"])
@auth_required("token")
def sections():
    if request.method=="GET":
        sections=Section.query.all()
        if not sections:
            return jsonify({"message":"No sections available"}), 404
        section=[]
        for x in sections:
            books=[]
            for y in x.ebooks:
                issued_books_user=[]
                for z in y.books_issued:
                    if z.returned!=True:
                        issued_books_user.append(str(z.user_id))
                books.append({"name": y.name, "author":y.author, "content":y.content, "id":y.id, "issued_users":issued_books_user, "rating":y.average_rating})
            section.append({
                'name': x.name,
                'id': x.id,
                'books':books
            })
            print(section)
        return jsonify({'sections': section}), 200
    elif request.method=="POST":
        newsection_data = request.get_json()
        section_name = newsection_data.get('name')
        section_books = newsection_data.get('books', [])
        if not section_name:
            return jsonify({"message": "Section name is required"}), 400
        new_section = Section(name=section_name)
        if section_books:
            books = Ebook.query.filter(Ebook.id.in_(section_books)).all()
            new_section.ebooks.extend(books)
        db.session.add(new_section)
        db.session.commit()

        return jsonify({"section_id":new_section.id}), 201
    elif request.method=="DELETE":
        newdata=request.get_json()
        sect_id=newdata.get('section_id')
        sect = Section.query.get(int(sect_id))
        sect.ebooks.clear()
        db.session.delete(sect)
        db.session.commit()
        return jsonify({"message": "Deleted Successfully"}), 200



@app.route("/all_requests")
@auth_required("token")
@roles_required("Librarian")
def all_requests():
    reqs=Requests.query.filter_by(status="Pending").all()
    if not reqs:
        return jsonify({"message":"No requests"}), 404
    req=[]
    for x in reqs:
        user=User.query.get(x.user_id)
        user_email=user.email
        book=Ebook.query.get(x.book_id)
        book_name=book.name
        req.append({"user_id": x.user_id, "book_id": x.book_id, "on":x.request_date, "user_email":user_email, "book_name":book_name})
    return jsonify({"data":req}), 200


@app.route("/approve/<user_id>/<book_id>")
@auth_required("token")
@roles_required("Librarian")
def approve(user_id, book_id):
    req=Requests.query.filter_by(user_id=int(user_id), book_id=int(book_id), status="Pending").one()
    req.status="Accepted"
    user=User.query.get(int(user_id))
    if not user:
        return jsonify({"message": "User doesnt exist"}), 404
    book=Ebook.query.get(int(book_id))
    if not book:
        return jsonify({"message": "book not found"}), 404
    approve_record = BooksIssued(book_id=int(book_id), user_id=int(user_id))
    db.session.add(approve_record)
    db.session.commit()
    approve_record.return_date=approve_record.issue_date+timedelta(days=5)
    db.session.commit()
    return jsonify({"message":"done"}), 200


@app.route("/all_users")
@auth_required("token")
@roles_required("Librarian")
def all_users():
    users=User.query.all()
    if not users:
        return jsonify({"message": "No users found"}), 404
    user=[]
    for x in users:
        role=x.roles
        print(role)
        for y in role:
            user_role=y.name
        if user_role=="User":
            issued_books = BooksIssued.query.filter_by(user_id=x.id).all()
            user.append({"user_email":x.email, "user_status":x.active, "user_id":x.id, "issued_books":len(issued_books)})
    return jsonify({"data":user}), 200



@app.route("/update_book/<book_id>", methods=["POST"])
@auth_required("token")
@roles_required("Librarian")
def update_book(book_id):
    book=Ebook.query.get(int(book_id))
    if not book:
        return jsonify({"message": "Book Not found"}), 404
    data=request.get_json()
    if not data:
        return jsonify({"message": "Provide correct Data"}), 404
    if 'name' in data:
        book.name = data['name']
    if 'author' in data:
        book.author = data['author']
    if 'content' in data:
        book.content = data['content']
    db.session.commit()
    return jsonify({"message": "updated Successfully"}), 200

@app.route("/create_book", methods=["POST"])
@auth_required("token")
@roles_required("Librarian")
def create_book():
    data=request.get_json()
    if not data:
        return jsonify({"message": "Pls. provide name and content"}), 404
    if 'name' not in data.keys():
        return jsonify({"message": "pls. provide book name"}), 404
    if 'content' not in data.keys():
        return jsonify({"message": "pls. provide book content"}), 404
    book=Ebook(name=data['name'], content=data['content'])
    db.session.add(book)
    db.session.commit()
    return jsonify({"id": book.id, "author":book.author}), 200

@app.route("/reject/<user_id>/<book_id>")
@auth_required("token")
@roles_required("Librarian")
def reject(user_id, book_id):
    user=User.query.get(int(user_id))
    if not user:
        return jsonify({"message": "User doesnt exist"}), 404
    book=Ebook.query.get(int(book_id))
    if not book:
        return jsonify({"message": "book not found"}), 404
    req=Requests.query.filter_by(user_id=int(user_id), book_id=int(book_id), status="Pending").one()
    req.status="Rejected"
    db.session.commit()
    return jsonify({"message": "done"}), 200


@app.route("/update_section", methods=["POST"])
@auth_required("token")
@roles_required("Librarian")
def update_section():
    if request.method == "POST":
        print(request.get_json())
        newsection_data = request.get_json()
        section_name = newsection_data.get('name')
        section_id = newsection_data.get('id')
        section_books = newsection_data.get('books', [])

        # Fetch the section to update
        sect = Section.query.get(int(section_id))
        if not sect:
            return jsonify({"message": "Section not found"}), 404
        
        # Update section name
        sect.name = section_name

        # Clear the existing books
        sect.ebooks = []  # This will clear the relationship
        
        # Add new books if there are any
        if section_books:
            books = Ebook.query.filter(Ebook.id.in_(section_books)).all()
            sect.ebooks.extend(books)  # Add new books to the relationship

        # Commit changes to the database
        try:
            db.session.commit()
            return jsonify({"message": "Update Successfully"}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({"message": "An error occurred", "error": str(e)}), 500


@app.route("/delete", methods=["POST"])
@roles_required("Librarian")
def delete():
    if request.method=="POST":
        json_data=request.get_json()
        book_id=json_data.get("book_id")
        book=Ebook.query.get(int(book_id))
        if book:
            book.ratings.clear()
            book.books_issued.clear()
            book.sections.clear()
            db.session.delete(book)
            db.session.commit()
    return jsonify({"message": "deleted Successfully"}), 200


@app.get('/download-user-data')

def download_user_csv():
    task = user_records.delay()
    return jsonify({"task-id": task.id})

@app.get('/download-issued-books-csv')

def download_issued_books_csv():
    task = get_books_issued_csv.delay()
    return jsonify({"task-id": task.id})


@app.route('/download_user', methods=["POST"])
@auth_required("token")
@roles_required("User")
def download_user():
    if request.method=="POST":
        data=request.get_json()
        user_id=data.get('user_id')
        task = get_user_data_csv.delay(int(user_id))
        return jsonify({"task-id": task.id})


@app.get('/get-csv/<task_id>')
def get_csv(task_id):
    res = AsyncResult(task_id)
    if res.ready():
        filename = res.result
        print(filename)
        return send_file(filename, as_attachment=True, mimetype="text/csv"), 200
    else:
        print(task_id)
        return jsonify({"message": "Task Pending"}), 404
    

@app.route("/rate_book", methods=["POST"])
@auth_required("token")
@roles_required("User")
def ratings():

    if request.method=="POST":
        rate_card=request.get_json()
        book_id=rate_card.get('book_id')
        user_id=rate_card.get('user_id')
        rating=rate_card.get('stars')
        ex_rating=Rating.query.filter_by(user_id=int(user_id), ebook_id=int(book_id)).first()
        if ex_rating:
            ex_rating.rating=float(rating)
            db.session.commit()
            rated_book=Ebook.query.get(int(book_id))
            return jsonify({"updated_book_rating":rated_book.average_rating}), 200
        rating=Rating(rating=float(rating), ebook_id=int(book_id), user_id=int(user_id))
        db.session.add(rating)
        db.session.commit()
        rated_book=Ebook.query.get(int(book_id))
        return jsonify({"updated_book_rating":rated_book.average_rating}), 200


@app.route("/activate_user/<user_id>")
@auth_required("token")
@roles_required("Librarian")
def activate_user(user_id):
    user=User.query.get(int(user_id))
    user.active=True
    db.session.commit()
    return jsonify({"message": "user activated successfully"}), 200

@app.route("/deactivate_user/<user_id>")
@auth_required("token")
@roles_required("Librarian")
def deactivate_user(user_id):
    user=User.query.get(int(user_id))
    user.active=False
    db.session.commit()
    return jsonify({"message": "user deactivated successfully"}), 200