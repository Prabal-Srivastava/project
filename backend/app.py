from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_socketio import SocketIO
from pymongo import MongoClient
from config import Config
import os
import time

app = Flask(__name__)
app.config.from_object(Config)

# Initialize extensions
CORS(app)
jwt = JWTManager(app)
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='eventlet')

# Initialize MongoDB client with retry logic
mongo_client = None

def get_db():
    global mongo_client
    if mongo_client is None:
        init_db()
    return mongo_client.get_default_database()

def init_db():
    global mongo_client
    if mongo_client is not None:
        return
    
    retries = 5
    while retries > 0:
        try:
            mongo_client = MongoClient(app.config['MONGODB_URI'], serverSelectionTimeoutMS=5000)
            # Test connection
            mongo_client.server_info()
            print("Successfully connected to MongoDB")
            break
        except Exception as e:
            print(f"Failed to connect to MongoDB, retrying... ({retries} left)")
            time.sleep(2)
            retries -= 1
    
    if mongo_client is None:
        raise Exception("Could not connect to MongoDB after multiple retries")

# Register Blueprints
from blueprints.auth import auth_bp
from blueprints.projects import projects_bp
from blueprints.execution import execution_bp

app.register_blueprint(auth_bp, url_prefix='/auth')
app.register_blueprint(projects_bp, url_prefix='/history')
app.register_blueprint(execution_bp, url_prefix='/')

@app.route('/health')
def health():
    return jsonify({"status": "CodeRunner Flask API is running"}), 200

if __name__ == '__main__':
    with app.app_context():
        db = get_db()
        # Ensure required collections
        if "users" not in db.list_collection_names():
            db.create_collection("users")
        if "projects" not in db.list_collection_names():
            db.create_collection("projects")
        if "executions" not in db.list_collection_names():
            db.create_collection("executions")
    
    # Running on port 5000 as requested by Nginx config
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)
