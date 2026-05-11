import os

def get_database_url():
    url = os.environ.get('DATABASE_URL', 'mysql+pymysql://root:1234@localhost/taskmanager')
    if url and url.startswith('mysql://'):
        url = url.replace('mysql://', 'mysql+pymysql://', 1)
    return url

class Config:
    SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'super-secret-key-for-taskmanager-app-2024')
    SQLALCHEMY_DATABASE_URI = get_database_url()
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'super-secret-key-for-taskmanager-app-2024')