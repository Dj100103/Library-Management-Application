# Library Management System

## Problem Statement
In the digital age, managing library resources effectively is crucial for educational institutions. This project aims to address inefficiencies in managing library books, tracking issued books, handling user requests, and maintaining user profiles.

## Approach
To tackle these challenges, we designed a comprehensive web-based Library Management System. The system is built using:

- **Backend:** Flask, providing RESTful APIs for CRUD operations.
- **Frontend:** Vue.js, offering a responsive and user-friendly interface.

Users can view available books, issue and return books, request books, and update their profiles. Administrators can manage books, sections, and user requests.

## Implementation

- **Frontend:** 
  - Built using Vue.js with Vue Router for a responsive and intuitive user experience.

- **Backend:** 
  - Developed with Flask, utilizing Flask-SQLAlchemy for database management and Flask-Security for authentication.
  - Background tasks and notifications are managed using Celery.

- **Database:**
  - Managed with SQLAlchemy to handle data efficiently.

- **Additional Features:**
  - Email notifications for book return reminders.
  - Data export functionality for better management and reporting.

## Frameworks and Libraries Used

- **Frontend:**
  - Vue.js
  - Vue Router

- **Backend:**
  - Flask
  - Flask-SQLAlchemy
  - Flask-Security (for authentication)
  - Celery (for background tasks and notifications)

- **Database:**
  - My SQL

- **Other Tools:**
  - Flask-Cache (for caching)
  - Redis (for backend jobs)
  - Flask-Mail (for sending emails)

## ER Diagram

The ER Diagram illustrates the following tables and their relationships:

- **User:** Manages user details.
- **Ebook:** Represents books in the library.
- **BooksIssued:** Tracks issued books and their return status.
- **Requests:** Manages book requests from users.
- **Rating:** Handles user ratings for books.
- **Section:** Represents sections in the library containing multiple books.
- **RoleUsers:** Stores the role of the users.
- **Ebook_Section:** Stores books in a particular section.

## API Resource Endpoints

- **User Endpoints:**
  - `POST /user_login`: Authenticates a user.
  - `GET /user_details`: Retrieves user details.
  - `POST /update_profile`: Updates user profile.

- **Book Endpoints:**
  - `GET /all_books`: Retrieves all books.
  - `GET /user_books/<id>`: Retrieves books issued to a user.
  - `POST /rate_book`: Allows users to rate a book.

- **Administrative Endpoints:**
  - `POST /create_book`: Adds a new book to the library.
  - `POST /update_book/<book_id>`: Updates book details.
  - `DELETE /delete`: Deletes a book.

- **Stats Endpoints:**
  - `GET /api/<stat_name>`: Provides statistics and graphs.
