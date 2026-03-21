from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import uuid
from datetime import datetime
from bson import ObjectId
import os

execution_bp = Blueprint('execution', __name__)

def get_db():
    from app import get_db as _get_db
    return _get_db()

@execution_bp.route('/submit', methods=['POST'])
@jwt_required()
def execute_code():
    user_id = get_jwt_identity()
    data = request.get_json()
    code = data.get('code')
    language = data.get('language')
    stdin = data.get('stdin', '')
    
    if not code or not language:
        return jsonify({"error": "Code and language are required"}), 400
    
    db = get_db()
    job_id = str(uuid.uuid4())
    execution_id = db.executions.insert_one({
        "user_id": user_id,
        "code": code,
        "language": language,
        "stdin": stdin,
        "job_id": job_id,
        "status": 'pending',
        "stdout": "",
        "stderr": "",
        "execution_time": None,
        "created_at": datetime.now()
    }).inserted_id
    
    # Trigger Celery task
    from tasks import run_code_task
    run_code_task.delay(str(execution_id))
    
    return jsonify({
        "job_id": job_id,
        "status": 'pending'
    }), 202

@execution_bp.route('/job/<job_id>', methods=['GET'])
@jwt_required()
def get_result(job_id):
    user_id = get_jwt_identity()
    db = get_db()
    execution = db.executions.find_one({"job_id": job_id, "user_id": user_id})
    
    if not execution:
        return jsonify({"error": "Execution not found"}), 404
    
    execution['id'] = str(execution['_id'])
    del execution['_id']
    return jsonify(execution), 200
