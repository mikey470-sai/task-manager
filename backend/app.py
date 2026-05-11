from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
from config import Config
from models import db

app = Flask(__name__)
app.config.from_object(Config)

db.init_app(app)
jwt = JWTManager(app)
CORS(app, resources={r"/*": {"origins": "*"}})
migrate = Migrate(app, db)

from routes.auth import auth_bp
from routes.projects import projects_bp
from routes.tasks import tasks_bp
from routes.dashboard import dashboard_bp

app.register_blueprint(auth_bp, url_prefix='/auth')
app.register_blueprint(projects_bp, url_prefix='/projects')
app.register_blueprint(tasks_bp, url_prefix='')
app.register_blueprint(dashboard_bp, url_prefix='')

if __name__ == '__main__':
    app.run(debug=True, port=5000)
