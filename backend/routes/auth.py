from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models import db, User
import bcrypt

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    if not data.get('email') or not data.get('password') or not data.get('name'):
        return jsonify({'error': 'Name, email and password are required'}), 400
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 409
    hashed = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt())
    user = User(name=data['name'], email=data['email'], password_hash=hashed.decode('utf-8'))
    db.session.add(user)
    db.session.commit()
    token = create_access_token(identity=str(user.id))
    return jsonify({'token': token, 'user': {'id': user.id, 'name': user.name, 'email': user.email}}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Email and password are required'}), 400
    user = User.query.filter_by(email=data['email']).first()
    if not user or not bcrypt.checkpw(data['password'].encode('utf-8'), user.password_hash.encode('utf-8')):
        return jsonify({'error': 'Invalid credentials'}), 401
    token = create_access_token(identity=str(user.id))
    return jsonify({'token': token, 'user': {'id': user.id, 'name': user.name, 'email': user.email}}), 200

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def me():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    return jsonify({'id': user.id, 'name': user.name, 'email': user.email})
