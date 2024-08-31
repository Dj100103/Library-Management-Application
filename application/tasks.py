from celery import shared_task
import flask_excel as excel
from .mail import mail
from flask_mail import Message
from .models import User, Role, Ebook, Section, BooksIssued, ebook_section, db, Rating, Requests
from jinja2 import Template
import pandas as pd
from io import StringIO, BytesIO
from datetime import datetime, timedelta
from flask import current_app


@shared_task(ignore_result=False)
def get_user_data_csv(user_id):
    all_rows_format=[]
    # Fetch the specific user record
    user = User.query.get(user_id)
    if not user:
        raise ValueError(f"User with ID {user_id} not found")

    # Fetch issued books and ratings for the specific user
    user_books = BooksIssued.query.filter_by(user_id=user.id).all()
    user_ratings = Rating.query.filter_by(user_id=user.id).all()

    # Prepare data for CSV
    data = []

    # User details
    user_details = [user.id, user.username, user.email, user.registered_on]
    
    # Add issued books data
    for book in user_books:
        data.append(user_details + [
            book.book_id, book.issue_date, book.return_date,
            '', '', ''
        ])
    
    # Add ratings data
    for rating in user_ratings:
        data.append(user_details + [
            '', '', '',
            rating.id, rating.rating, rating.rated_on
        ])

    # Create a DataFrame with the collected data
    columns = [
        "User ID", "Username", "Email", "Registered On",
        "Book ID", "Issue Date", "Return Date",
        "Rating ID", "Rating Value", "Rated On"
    ]
    
    # Use flask_excel to create CSV file
    output =BytesIO()
    csv_output = excel.make_response_from_array(data, column_names=columns, file_type="csv")
    output.write(csv_output.data)
    output.seek(0)
    
    # Save the file
    filename = f"user_data_{user_id}.csv"
    with open(filename, 'wb') as f:
        f.write(output.getvalue())
    
    return filename


@shared_task(ignore_result=False)
def get_books_issued_csv():
    book_issued_records = BooksIssued.query.with_entities(
        BooksIssued.book_id,
        BooksIssued.user_id,
        BooksIssued.issue_date,
        BooksIssued.return_date).all()
    csv_output = excel.make_response_from_query_sets(
        book_issued_records, ["book_id", "user_id", "issue_date", "return_date"], "csv")
    filename = "test1.csv"
    with open(filename, 'wb') as f:
        f.write(csv_output.data)

    return filename


@shared_task(ignore_result=False)
def user_records():
    user_records =User.query.with_entities(
        User.id,
        User.email,
        User.registered_on).all()
    csv_output = excel.make_response_from_query_sets(
        user_records, ["id", "email", "registered_on"], "csv")
    filename = "test2.csv"
    with open(filename, 'wb') as f:
        f.write(csv_output.data)

    return filename


@shared_task(ignore_result=True)
def daily_reminder_task():
    users = User.query.all()
    for user in users:
        msg = Message(
            subject='Daily Reminder',
            sender='21f3002500@ds.study.iitm.ac.in',  # Replace with your actual sender email
            recipients=[user.email]
        )
        msg.body = "This is your daily reminder."
        mail.send(msg)
    return "Daily reminders sent!"


@shared_task(ignore_result=True)
def send_due_date_reminders():
    # Get the current UTC datetime
    now = datetime.now()

    # Define the start and end of today
    start_of_day = now.replace(hour=0, minute=0, second=0, microsecond=0)  # Start of today
    end_of_day = start_of_day + timedelta(days=1)  # End of today

    # Query books where the return_date is today and the book is not returned yet
    due_books = BooksIssued.query.filter(
        BooksIssued.return_date >= start_of_day,
        BooksIssued.return_date < end_of_day,
        BooksIssued.returned == False
    ).all()

    for book in due_books:
        user = User.query.get(book.user_id)
        if user:
            msg = Message(
                subject='Book Return Reminder',
                sender='21f3002500@ds.study.iitm.ac.in',  # Replace with your actual sender email
                recipients=[user.email]
            )
            msg.body = (f"Hello {user.username},\n\n"
                        f"This is a reminder to return the book '{book.ebook.name}' "
                        f"by today. Thank you!")
            mail.send(msg)
    return "Due date reminders sent!"