class Config(object):
    DEBUG = False
    TESTING = False


class DevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///database.sqlite3'
    SECRET_KEY = "DEV"
    SECURITY_PASSWORD_SALT = "create a password"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    WTF_CSRF_ENABLED = False
    SECURITY_TOKEN_AUTHENTICATION_HEADER = 'Authentication-Token'
    MAIL_SERVER = 'smtp.gmail.com'
    MAIL_PORT = 587
    MAIL_USERNAME = 'your_mail_id'  # Use your actual Gmail address
    MAIL_PASSWORD = 'app_generated_password'     # Use your generated App Password
    MAIL_USE_TLS= True
    MAIL_USE_SSL= False
    CACHE_TYPE = "RedisCache"
    CACHE_REDIS_HOST = "localhost"
    CACHE_REDIS_PORT = 6379
    CACHE_REDIS_DB = 3
    
