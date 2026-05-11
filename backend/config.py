import os

class Config:
    SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'super-secret-key-for-taskmanager-app-2024')
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        'DATABASE_URL',
        'mysql+pymysql://root:1234@localhost/taskmanager'
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'super-secret-key-for-taskmanager-app-2024')
