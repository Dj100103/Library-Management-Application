class Config(object):
    DEBUG = False
    TESTING = False


class DevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///database.sqlite3'
    SECRET_KEY = "DEV"
    SECURITY_PASSWORD_SALT = "this is dev"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    WTF_CSRF_ENABLED = False
    SECURITY_TOKEN_AUTHENTICATION_HEADER = 'Authentication-Token'
    MAIL_SERVER = 'smtp.gmail.com'
    MAIL_PORT = 587
    MAIL_USERNAME = '21f3002500@ds.study.iitm.ac.in'  # Use your actual Gmail address
    MAIL_PASSWORD = 'yrbm jovj dzlk uitr'     # Use your generated App Password
    MAIL_USE_TLS= True
    MAIL_USE_SSL= False
    CACHE_TYPE = "RedisCache"
    CACHE_REDIS_HOST = "localhost"
    CACHE_REDIS_PORT = 6379
    CACHE_REDIS_DB = 3
    