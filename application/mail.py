from flask_mail import Message
from main import mail

sender_mail='21f3002500@ds.study.iitm.ac.in'
def send_mail(to, subject, content_body):
    # mail=app.extensions.get('mail')
    msg = Message(
        subject=subject, 
        sender=sender_mail,  # Ensure this matches MAIL_USERNAME
        recipients=to  # Replace with actual recipient's email
    )
    msg.body = content_body
    mail.send(msg)
    return "Message sent!"