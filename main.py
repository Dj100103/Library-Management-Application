from flask import Flask
from flask_security import Security
from application.models import db
from config import DevelopmentConfig
from application.Graphs import api
from application.sec import datastore
from application.worker import celery_init_app
import flask_excel as excel
from celery.schedules import crontab
from flask_mail import Mail, Message
from application.Cache import cache
mail=Mail()

def create_app():
    app = Flask(__name__)
    app.config.from_object(DevelopmentConfig)
    db.init_app(app)
    api.init_app(app)
    excel.init_excel(app)
    mail.init_app(app)
    cache.init_app(app)
    app.security = Security(app, datastore)
    with app.app_context():
        import application.views

    return app


app = create_app()
celery_app = celery_init_app(app)


celery_app.conf.beat_schedule = {
    'daily-user-reminder': {
        'task': 'application.tasks.daily_reminder_task',
        'schedule': crontab(hour=18, minute=20),  # Runs every day at 5:10 PM
    },
    'due-date-reminders' :{
        'task':'application.tasks.send_due_date_reminders',
        'schedule': crontab(hour=19, minute=30)
    }
}


if __name__ == '__main__':
    app.run(debug=True)