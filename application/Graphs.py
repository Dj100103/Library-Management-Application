from flask import Response, jsonify
from flask_restful import Api, Resource
import matplotlib.pyplot as plt
import matplotlib
import io
import pandas as pd
from .models import  BooksIssued, User, Requests, Ebook, Rating, db
from sqlalchemy import func

matplotlib.use('agg')  # Use 'agg' backend for rendering images without a display

# Initialize Flask app and Flask-RESTful API
api = Api(prefix="/api")


class UserRequestsVsIssuedBooks(Resource):
    def get(self, user_id):
        user = User.query.get(user_id)
        if not user:
            return {'message': 'User not found'}, 404

        # Data processing
        total_requests = Requests.query.filter_by(user_id=user_id).count()
        # accepted_requests = Requests.query.filter_by(user_id=user_id, status='Accepted').count()
        issued_books = BooksIssued.query.filter_by(user_id=user_id).count()

        # Plotting
        plt.figure(figsize=(8, 4))
        categories = ['Total Requests', 'Issued Books']
        values = [total_requests, issued_books]
        plt.bar(categories, values, color=['#ff9999', '#66b3ff'])
        plt.title('Requests vs Issued Books')
        plt.xlabel('Category')
        plt.ylabel('Count')
        plt.grid(True)

        # Save plot to a BytesIO object
        img = io.BytesIO()
        plt.savefig(img, format='png')
        img.seek(0)
        plt.close()

        return Response(img, mimetype='image/png')

class UserBooksIssuedOverTime(Resource):
    def get(self, user_id):
        user = User.query.get(user_id)
        if not user:
            return {'message': 'User not found'}, 404

        # Data processing
        issued_books = BooksIssued.query.filter_by(user_id=user_id).all()
        dates = [issued.issue_date.date() for issued in issued_books]
        count_by_date = pd.Series(dates).value_counts().sort_index()
        print(count_by_date)

        # Plotting
        plt.figure(figsize=(8, 4))
        count_by_date.plot(kind='bar')
        plt.title('Books Issued Over Time')
        plt.xlabel('Date')
        plt.ylabel('Number of Books Issued')
        plt.grid(True)
        plt.xticks(rotation=0)
        # Save plot to a BytesIO object
        y_min, y_max = plt.ylim()

        # Generate whole number ticks from the minimum to the maximum y limit
        y_ticks = range(int(y_min), int(y_max) + 1)

        # Set y-ticks to whole numbers
        plt.yticks(ticks=y_ticks, labels=[str(i) for i in y_ticks])
        img = io.BytesIO()
        plt.savefig(img, format='png')
        img.seek(0)
        plt.close()

        return Response(img, mimetype='image/png')

class UserStatsTable(Resource):
    def get(self, user_id):
        user = User.query.get(user_id)
        if not user:
            return {'message': 'User not found'}, 404

        pending_requests_count = Requests.query.filter_by(user_id=user_id, status="Pending").count()
        accepted_requests_count = Requests.query.filter_by(user_id=user_id, status="Accepted").count()
        issued_books_count = BooksIssued.query.filter_by(user_id=user_id).count()
        returned_books_count = BooksIssued.query.filter_by(user_id=user_id, returned=True).count()
        current_books_count = issued_books_count - returned_books_count

        # Plotting table
        table_data = [
            ['Total Pending Requests', pending_requests_count],
            ['Total Accepted Requests', accepted_requests_count],
            ['Total Books Issued', issued_books_count],
            ['Total Books Returned', returned_books_count],
            ['Current Books Count', current_books_count]
        ]

        fig, ax = plt.subplots(figsize=(8, 4))
        ax.axis('off')
        table = plt.table(cellText=table_data,
                          colLabels=['Metric', 'Count'],
                          cellLoc='center',
                          loc='center',
                          bbox=[0, 0, 1, 1])
        table.auto_set_font_size(False)
        table.set_fontsize(12)
        table.auto_set_column_width([0, 1])

        # Save plot to a BytesIO object
        img = io.BytesIO()
        plt.savefig(img, format='png')
        img.seek(0)
        plt.close()

        return Response(img, mimetype='image/png')

class TotalRequestsOverTime(Resource):
    def get(self):
        # Data processing
        requests = Requests.query.all()
        dates = [request.request_date.date() for request in requests]
        count_by_date = pd.Series(dates).value_counts().sort_index()

        # Plotting
        plt.figure(figsize=(8, 4))
        count_by_date.plot(kind='bar')
        plt.title('Total Requests Over Time')
        plt.xlabel('Date')
        plt.ylabel('Number of Requests')
        plt.grid(True)
        plt.xticks(rotation=0)
        # Save plot to a BytesIO object
        y_min, y_max = plt.ylim()

        # Generate whole number ticks from the minimum to the maximum y limit
        y_ticks = range(int(y_min), int(y_max) + 1)

        # Set y-ticks to whole numbers
        plt.yticks(ticks=y_ticks, labels=[str(i) for i in y_ticks])
        # Save plot to a BytesIO object
        img = io.BytesIO()
        plt.savefig(img, format='png')
        img.seek(0)
        plt.close()

        return Response(img, mimetype='image/png')

class TotalBooksIssuedOverTime(Resource):
    def get(self):
        # Data processing
        issued_books = BooksIssued.query.all()
        dates = [issued.issue_date.date() for issued in issued_books]
        count_by_date = pd.Series(dates).value_counts().sort_index()

        # Plotting
        plt.figure(figsize=(8, 4))
        count_by_date.plot(kind='bar')
        plt.title('Total Books Issued Over Time')
        plt.xlabel('Date')
        plt.ylabel('Number of Books Issued')
        plt.grid(True)
        plt.xticks(rotation=0)
        # Save plot to a BytesIO object
        y_min, y_max = plt.ylim()

        # Generate whole number ticks from the minimum to the maximum y limit
        y_ticks = range(int(y_min), int(y_max) + 1)

        # Set y-ticks to whole numbers
        plt.yticks(ticks=y_ticks, labels=[str(i) for i in y_ticks])
        # Save plot to a BytesIO object
        img = io.BytesIO()
        plt.savefig(img, format='png')
        img.seek(0)
        plt.close()

        return Response(img, mimetype='image/png')

class TotalUserRegistrationsOverTime(Resource):
    def get(self):
        # Data processing
        users = User.query.all()
        dates = [user.registered_on.date() for user in users]
        count_by_date = pd.Series(dates).value_counts().sort_index()

        # Plotting
        plt.figure(figsize=(8, 4))
        count_by_date.plot(kind='bar')
        plt.title('Total User Registrations Over Time')
        plt.xlabel('Date')
        plt.ylabel('Number of Registrations')
        plt.grid(True)
        plt.xticks(rotation=0)
        # Save plot to a BytesIO object
        y_min, y_max = plt.ylim()

        # Generate whole number ticks from the minimum to the maximum y limit
        y_ticks = range(int(y_min), int(y_max) + 1)

        # Set y-ticks to whole numbers
        plt.yticks(ticks=y_ticks, labels=[str(i) for i in y_ticks])
        # Save plot to a BytesIO object
        img = io.BytesIO()
        plt.savefig(img, format='png')
        img.seek(0)
        plt.close()

        return Response(img, mimetype='image/png')

class LibrarianStatsTable(Resource):
    def get(self):
        # Data processing
        total_pending_requests = Requests.query.filter_by(status="Pending").count()
        total_books_issued = BooksIssued.query.count()
        books_to_be_taken_back = BooksIssued.query.filter_by(returned=False).count()

        # Plotting table
        table_data = [
            ['Total Pending Requests', total_pending_requests],
            ['Total Books Issued', total_books_issued],
            ['Books to be Taken Back', books_to_be_taken_back]
        ]

        fig, ax = plt.subplots(figsize=(8, 4))
        ax.axis('off')
        table = plt.table(cellText=table_data,
                          colLabels=['Metric', 'Count'],
                          cellLoc='center',
                          loc='center',
                          bbox=[0, 0, 1, 1])
        table.auto_set_font_size(False)
        table.set_fontsize(12)
        table.auto_set_column_width([0, 1])

        # Save plot to a BytesIO object
        img = io.BytesIO()
        plt.savefig(img, format='png')
        img.seek(0)
        plt.close()

        return Response(img, mimetype='image/png')
    
class TotalRequestsAcceptedRejected(Resource):
    def get(self):
        total_requests = Requests.query.count()
        accepted_requests = Requests.query.filter_by(status="Accepted").count()
        rejected_requests = Requests.query.filter_by(status="Rejected").count()

        # Plotting
        plt.figure(figsize=(8, 4))
        categories = ['Total Requests', 'Accepted Requests', 'Rejected Requests']
        values = [total_requests, accepted_requests, rejected_requests]
        plt.bar(categories, values, color=['#ff9999', '#66b3ff', '#ffcc99'])
        plt.title('Total Requests vs Accepted and Rejected Requests')
        plt.xlabel('Category')
        plt.ylabel('Count')
        plt.grid(True)

        # Save plot to a BytesIO object
        img = io.BytesIO()
        plt.savefig(img, format='png')
        img.seek(0)
        plt.close()

        return Response(img, mimetype='image/png')

class TopBooks(Resource):
    def get(self):
        # Query to get books with their average ratings
        books_with_ratings = db.session.query(
            Ebook.id,
            Ebook.name,
            func.avg(Rating.rating).label('average_rating')
        ).outerjoin(Rating, Ebook.id == Rating.ebook_id).group_by(Ebook.id).order_by(func.avg(Rating.rating).desc()).limit(5).all()

        # Prepare data for plotting with manual post-processing
        book_names = []
        ratings = []
        for book in books_with_ratings:
            book_names.append(book.name)
            # Replace None with 0 for average_rating
            ratings.append(book.average_rating if book.average_rating is not None else 0)

        # Plotting
        plt.figure(figsize=(8, 4))
        plt.barh(book_names, ratings, color='skyblue')
        plt.xlabel('Average Rating')
        plt.title('Top 5 Books by Average Rating')
        plt.grid(True)

        # Save plot to a BytesIO object
        img = io.BytesIO()
        plt.savefig(img, format='png')
        img.seek(0)
        plt.close()

        return Response(img, mimetype='image/png')


# Add resources to the API
api.add_resource(UserRequestsVsIssuedBooks, '/user_requests_vs_issued_books/<int:user_id>')
api.add_resource(UserBooksIssuedOverTime, '/user_books_issued_over_time/<int:user_id>')
api.add_resource(UserStatsTable, '/user_stats/<int:user_id>')
api.add_resource(TopBooks, '/topbooks')
api.add_resource(TotalRequestsOverTime, '/total_requests_over_time')
api.add_resource(TotalBooksIssuedOverTime, '/total_books_issued_over_time')
api.add_resource(TotalUserRegistrationsOverTime, '/total_user_registrations_over_time')
api.add_resource(TotalRequestsAcceptedRejected, '/total_requests_ar')
api.add_resource(LibrarianStatsTable, '/librarian_stats_table')
