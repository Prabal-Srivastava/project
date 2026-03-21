from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from pymongo import MongoClient
import os

auth_bp = Blueprint('auth', __name__)

# Use app.get_db to get the initialized database instance
def get_db():
    from app import get_db as _get_db
    return _get_db()

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({"error": "Username and password required"}), 400
    
    db = get_db()
    if db.users.find_one({"username": username}):
        return jsonify({"error": "User already exists"}), 400
    
    user_id = db.users.insert_one({
        "username": username,
        "email": email,
        "password": generate_password_hash(password)
    }).inserted_id
    
    access_token = create_access_token(identity=str(user_id))
    refresh_token = create_refresh_token(identity=str(user_id))
    
    return jsonify({
        "access": access_token,
        "refresh": refresh_token,
        "user": {"username": username, "email": email}
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    db = get_db()
    user = db.users.find_one({"username": username})
    
    if user and check_password_hash(user['password'], password):
        access_token = create_access_token(identity=str(user['_id']))
        refresh_token = create_refresh_token(identity=str(user['_id']))
        return jsonify({
            "access": access_token,
            "refresh": refresh_token,
            "user": {"username": user['username'], "email": user['email']}
        }), 200
    
    return jsonify({"error": "Invalid credentials"}), 401

@auth_bp.route('/token/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    identity = get_jwt_identity()
    access_token = create_access_token(identity=identity)
    return jsonify({"access": access_token}), 200
