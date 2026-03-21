from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
from datetime import datetime
import os

projects_bp = Blueprint('projects', __name__)

def get_db():
    from app import get_db as _get_db
    return _get_db()

@projects_bp.route('/', methods=['GET'])
@jwt_required()
def get_projects():
    user_id = get_jwt_identity()
    db = get_db()
    projects = list(db.projects.find({"owner_id": user_id}))
    for project in projects:
        project['id'] = str(project['_id'])
        del project['_id']
    return jsonify(projects), 200

@projects_bp.route('/', methods=['POST'])
@jwt_required()
def create_project():
    user_id = get_jwt_identity()
    data = request.get_json()
    name = data.get('name')
    description = data.get('description', '')
    
    if not name:
        return jsonify({"error": "Project name is required"}), 400
    
    db = get_db()
    project_id = db.projects.insert_one({
        "name": name,
        "description": description,
        "owner_id": user_id,
        "created_at": datetime.now(),
        "updated_at": datetime.now(),
        "files": []
    }).inserted_id
    
    return jsonify({"id": str(project_id), "name": name, "description": description}), 201

@projects_bp.route('/<project_id>', methods=['GET'])
@jwt_required()
def get_project(project_id):
    user_id = get_jwt_identity()
    db = get_db()
    project = db.projects.find_one({"_id": ObjectId(project_id), "owner_id": user_id})
    
    if not project:
        return jsonify({"error": "Project not found"}), 404
    
    project['id'] = str(project['_id'])
    del project['_id']
    return jsonify(project), 200

@projects_bp.route('/<project_id>/files', methods=['POST'])
@jwt_required()
def create_file(project_id):
    user_id = get_jwt_identity()
    data = request.get_json()
    name = data.get('name')
    content = data.get('content', '')
    language = data.get('language')
    
    if not name or not language:
        return jsonify({"error": "File name and language are required"}), 400
    
    db = get_db()
    file_id = ObjectId()
    new_file = {
        "id": str(file_id),
        "name": name,
        "content": content,
        "language": language,
        "created_at": datetime.now(),
        "updated_at": datetime.now()
    }
    
    result = db.projects.update_one(
        {"_id": ObjectId(project_id), "owner_id": user_id},
        {"$push": {"files": new_file}, "$set": {"updated_at": datetime.now()}}
    )
    
    if result.matched_count == 0:
        return jsonify({"error": "Project not found or unauthorized"}), 404
    
    return jsonify(new_file), 201
