from flask_sqlalchemy import SQLAlchemy
from flask_security import UserMixin, RoleMixin
from datetime import timedelta

db = SQLAlchemy()

ebook_section = db.Table('ebook_section',
    db.Column('ebook_id', db.Integer, db.ForeignKey('ebook.id'), primary_key=True),
    db.Column('section_id', db.Integer, db.ForeignKey('section.id'), primary_key=True)
)

class Rating(db.Model):
    __tablename__ = 'ratings'
    id = db.Column(db.Integer, primary_key=True)
    rating = db.Column(db.Float, nullable=False)  # Rating value (e.g., 1.0 to 5.0)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    ebook_id = db.Column(db.Integer, db.ForeignKey('ebook.id'), nullable=False)
    rated_on = db.Column(db.DateTime, nullable=False, default=db.func.current_timestamp())



class RolesUsers(db.Model):
    __tablename__ = 'roles_users'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    role_id = db.Column(db.Integer, db.ForeignKey('role.id'))

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String, unique=False)
    email = db.Column(db.String, unique=True)
    password = db.Column(db.String(255))
    active = db.Column(db.Boolean())
    fs_uniquifier = db.Column(db.String(255), unique=True, nullable=False)
    roles = db.relationship('Role', secondary='roles_users',
                            backref=db.backref('users', lazy='dynamic'))
    registered_on=db.Column(db.DateTime, nullable=False, default=db.func.current_timestamp())

class Role(db.Model, RoleMixin):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), unique=True)
    description = db.Column(db.String(255))

class Ebook(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    content = db.Column(db.Text, nullable=False)
    author = db.Column(db.String)
    books_issued = db.relationship('BooksIssued', backref='ebook', lazy=True)
    sections = db.relationship('Section', secondary=ebook_section,
                               back_populates='ebooks')
    created_on=db.Column(db.DateTime, nullable=False, default=db.func.current_timestamp())
    ratings = db.relationship('Rating', backref='ebook', lazy=True)

    @property
    def average_rating(self):
        if not self.ratings:
            return 0
        total_ratings = sum(r.rating for r in self.ratings)
        return total_ratings / len(self.ratings)

class Section(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    date_created = db.Column(db.DateTime, nullable=False, default=db.func.current_timestamp())
    ebooks = db.relationship('Ebook', secondary=ebook_section,
                             back_populates='sections')

class BooksIssued(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    book_id = db.Column(db.Integer, db.ForeignKey('ebook.id'))
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    issue_date = db.Column(db.DateTime, nullable=False, default=db.func.current_timestamp())
    return_date = db.Column(db.DateTime)
    returned=db.Column(db.Boolean(), default=False)
    user = db.relationship('User', backref=db.backref('books_issued', lazy=True))

class Requests(db.Model):
    id=db.Column(db.Integer, primary_key=True)
    book_id = db.Column(db.Integer, db.ForeignKey('ebook.id'))
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    request_date= db.Column(db.DateTime, nullable=False, default=db.func.current_timestamp())
    status=db.Column(db.String, default="Pending")
