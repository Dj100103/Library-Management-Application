from main import app
from application.models import db, Role, User, Ebook, BooksIssued, Requests
from datetime import timedelta, datetime
from application.sec import datastore
# from flask_security import generate_password_hash
from werkzeug.security import generate_password_hash

with app.app_context():
    db.create_all()
    datastore.find_or_create_role(name="Librarian", description="The user is a librarian")
    datastore.find_or_create_role(name="User", description="The user is a general user")
    db.session.commit()
    if not datastore.find_user(email='msahi6103@gmail.com'):
        datastore.create_user(email="msahi6103@gmail.com", password=generate_password_hash("12345"), roles=["Librarian"])
    if not datastore.find_user(email="msahi6107@gmail.com"):
        datastore.create_user(email="msahi6107@gmail.com", password=generate_password_hash("12345"), roles=["User"])
    if not datastore.find_user(email="msahi6108@gmail.com"):
        datastore.create_user(email="msahi6108@gmail.com", password=generate_password_hash("12345"), roles=["User"])
    db.session.commit()
    book_1=Ebook(name='Alpha', content='Alpha Book')
    book_2=Ebook(name='Beta', content='Beta Book')
    book_3=Ebook(name='Charlie', content='Charlie Book')
    book_4=Ebook(name='Delta', content='Delta Book')
    book_5=Ebook(name='Eagle', content='Gamma Book')
    db.session.add(book_1)
    db.session.add(book_2)
    db.session.add(book_3)
    db.session.add(book_4)
    db.session.add(book_5)
    db.session.commit()
    request_1=Requests(book_id=1, user_id=2, status="Accepted")
    request_2=Requests(book_id=2, user_id=2)
    request_3=Requests(book_id=1, user_id=3, status="Accepted")
    request_4=Requests(book_id=3, user_id=3, status="Accepted")
    request_5=Requests(book_id=4, user_id=3)
    db.session.add(request_1)
    db.session.add(request_2)
    db.session.add(request_3)
    db.session.add(request_4)
    db.session.add(request_5)
    db.session.commit()
    issued_record = BooksIssued(book_id=1, user_id=2)
    issued_record1= BooksIssued(book_id=1, user_id=3)
    issued_record2= BooksIssued(book_id=3, user_id=3)
    db.session.add(issued_record)
    db.session.add(issued_record1)
    db.session.add(issued_record2)
    db.session.commit()
    issued_record.return_date=issued_record.issue_date+timedelta(days=5)
    issued_record1.return_date=issued_record1.issue_date+timedelta(days=5)
    issued_record2.return_date=issued_record2.issue_date+timedelta(days=5)
    db.session.commit()
