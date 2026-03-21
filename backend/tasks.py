import subprocess
import time
import os
import uuid
from celery import Celery
from bson import ObjectId
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

# Initialize Celery
celery_app = Celery('tasks')
celery_app.conf.broker_url = os.getenv("CELERY_BROKER_URL", "redis://redis:6379/0")
celery_app.conf.result_backend = os.getenv("CELERY_RESULT_BACKEND", "redis://redis:6379/0")
celery_app.conf.broker_connection_retry_on_startup = True

# Initialize MongoDB client
mongo_client = MongoClient(os.getenv("MONGODB_URI", "mongodb://mongodb:27017/coderunner"))
db = mongo_client.get_default_database()

@celery_app.task(name='tasks.run_code_task')
def run_code_task(execution_id):
    try:
        execution = db.executions.find_one({"_id": ObjectId(execution_id)})
        if not execution:
            return
        
        db.executions.update_one({"_id": ObjectId(execution_id)}, {"$set": {"status": 'running'}})

        code = execution['code']
        language = execution['language']
        stdin = execution.get('stdin', '')
        
        start_time = time.time()
        
        # Build Sandbox command
        lang_map = {
            'python': 'sandbox-python',
            'javascript': 'sandbox-node',
            'node': 'sandbox-node',
            'cpp': 'sandbox-cpp',
            'java': 'sandbox-java',
            'ruby': 'sandbox-ruby',
            'go': 'sandbox-go'
        }
        
        image_name = lang_map.get(language, f'sandbox-{language}')
        
        import base64
        code_b64 = base64.b64encode(code.encode('utf-8')).decode('utf-8')
        
        try:
            process = subprocess.Popen(
                ["docker", "run", "--rm", "-i", "-e", f"CODE_B64={code_b64}", image_name],
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            
            # The entire stdin is now just the user input
            stdout, stderr = process.communicate(input=stdin, timeout=15)
            
            if process.returncode == 0:
                status = 'completed'
            else:
                status = 'failed'
                
        except subprocess.TimeoutExpired:
            process.kill()
            stdout, stderr = process.communicate()
            stdout = stdout + "\n[Execution Timed Out]"
            status = 'timeout'
        except Exception as e:
            stdout = ""
            stderr = f"Error starting sandbox: {str(e)}"
            status = 'failed'

        db.executions.update_one({"_id": ObjectId(execution_id)}, {
            "$set": {
                "stdout": stdout,
                "stderr": stderr,
                "status": status,
                "execution_time": round(time.time() - start_time, 3)
            }
        })

    except Exception as e:
        print(f"Error in run_code_task: {str(e)}")
        db.executions.update_one({"_id": ObjectId(execution_id)}, {"$set": {"status": 'failed', "stderr": str(e)}})
