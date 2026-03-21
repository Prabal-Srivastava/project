# CodeRunner SaaS: Multi-Language Online Code Execution Platform

CodeRunner is a production-ready, multi-language online code execution platform built as a SaaS product. It provides an isolated, secure environment for users to write, compile, and execute code in various programming languages.

## 🚀 Key Features

- **Multi-Language Support**: Secure sandboxes for Python 3, Node.js, C++ (GCC), Java (Temurin 21), Ruby, and Go.
- **Dynamic Environment**: Instant editor synchronization when switching languages, including automatic boilerplate generation.
- **Isolated Execution**: Each code execution runs in its own ephemeral Docker container with resource limits.
- **Modern Code Editor**: Integrated Monaco Editor with syntax highlighting, auto-completion, and forced environment refresh for a clean coding experience.
- **User Input (stdin)**: Full support for passing standard input to your code snippets during execution.
- **User Dashboard**: Manage multiple code projects and workspaces with a sleek, modern UI.
- **Secure Authentication**: JWT-based authentication using `flask-jwt-extended` with automatic token refresh.
- **Microservice Architecture**: Built with a modular Flask Blueprint architecture for high scalability.
- **Real-time Results**: Asynchronous task processing with Celery and Redis.

## 🛠️ Tech Stack

### Frontend
- **Framework**: React + Vite
- **Styling**: Tailwind CSS v3 (Optimized for production)
- **Editor**: Monaco Editor (`@monaco-editor/react`) with dynamic key re-mounting.
- **Icons**: Lucide React
- **Animation**: Framer Motion
- **API Client**: Axios with automatic token refresh

### Backend
- **Framework**: Flask (Modular Blueprint Architecture)
- **Port**: 5000 (Aligned with Nginx host proxy)
- **Task Queue**: Celery + Redis
- **Database**: MongoDB (via `pymongo` with built-in connection retry logic)
- **Authentication**: JWT (`flask-jwt-extended`)
- **Isolation Layer**: Docker-based sandbox containers

---

## ☁️ AWS EC2 Deployment Guide (Ubuntu)

Follow this step-by-step guide to set up CodeRunner on an AWS EC2 Ubuntu instance using the Flask-based microservice architecture and manual Nginx configuration.

### 1. Initial Server Setup
SSH into your EC2 instance and install Docker & Docker Compose:
```bash
sudo apt update && sudo apt upgrade -y
sudo apt-get install -y docker.io docker-compose
sudo usermod -aG docker $USER
newgrp docker

# Optimize Redis and System Performance (CRITICAL for Production)
# This prevents Redis 'Memory overcommit' warnings and performance issues
sudo sysctl vm.overcommit_memory=1
echo "vm.overcommit_memory=1" | sudo tee -a /etc/sysctl.conf

# Fix Docker socket permissions for backend access
sudo chmod 666 /var/run/docker.sock
```

### 2. Project Deployment
Clone the repository and build the sandbox images:
```bash
git clone https://github.com/your-username/mca-project.git
cd mca-project

# Build sandbox images for each language
# This creates the restricted Docker images used for code execution
chmod +x build-sandboxes.sh
./build-sandboxes.sh
```

#### Environment Configuration
Create a `.env` file in the `backend` folder to configure security keys and service URLs:
```bash
# backend/.env
SECRET_KEY=your-very-secure-secret-key
MONGODB_URI=mongodb://mongodb:27017/coderunner
CELERY_BROKER_URL=redis://redis:6379/0
CELERY_RESULT_BACKEND=redis://redis:6379/0
```

#### Frontend Build
Build the production assets for the frontend:
```bash
cd frontend
npm install
npm run build
cd ..
```

### 3. Configure Nginx on Host
Set up Nginx to serve the frontend and act as a reverse proxy for the backend services.

```bash
# Install Nginx
sudo apt install -y nginx

# Create the web directory and copy the built frontend
sudo mkdir -p /var/www/vhosts/frontend/build
sudo cp -R frontend/dist/* /var/www/vhosts/frontend/build/

# Remove the default Nginx configuration
sudo rm /etc/nginx/sites-enabled/default

# Create a new configuration file for our app
sudo nano /etc/nginx/sites-available/coderunner
```

Paste the following configuration into the `coderunner` file. This configures the proxy for all core services including **Authentication**, **Execution**, and **Project History**.

```nginx
server { 
    listen 80 default_server; 
    server_name _; 

    root /var/www/vhosts/frontend/build; 

    location / { 
        # Standard Single Page Application (SPA) routing
        try_files $uri $uri/ /index.html; 
    } 

    # Proxy WebSocket requests to the backend container (Port 5000)
    location /socket.io { 
        proxy_pass http://localhost:5000; 
        proxy_http_version 1.1; 
        proxy_set_header Upgrade $http_upgrade; 
        proxy_set_header Connection "Upgrade"; 
    } 

    # Proxy API requests to the Flask backend (submit, history, job, auth)
    # CRITICAL: Ensure all these paths are included for the platform to function
    location ~ ^/(submit|history|job|auth) { 
        proxy_pass http://localhost:5000; 
        proxy_set_header Host $host; 
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    } 
} 
```

Enable the site and restart Nginx:
```bash
# Enable the site and restart Nginx
sudo ln -s /etc/nginx/sites-available/coderunner /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 4. Running Core Services
Launch the backend services (Flask API, Celery Worker, Redis, MongoDB) with Docker Compose:

```bash
# IMPORTANT: If you changed any sandbox runner scripts, rebuild them
./build-sandboxes.sh

# Clean up any old containers and volumes first
docker-compose down -v

# Start the stack in detached mode
docker-compose up -d --build
```

---

## 🕹️ Working Guide & Platform Usage

### 🛠️ Using the Code Editor
1. **Language Selection**: Use the dropdown menu in the editor header to switch between Python, JavaScript, C++, Java, Ruby, and Go.
2. **Environment Isolation**: When you switch languages, the editor automatically re-mounts a fresh environment and provides a basic "Hello World" boilerplate for that specific language.
3. **Writing Code**: Write your logic directly in the Monaco Editor. Syntax highlighting and basic auto-completion are enabled.

### 📥 Handling User Input (stdin)
1. **Toggle Input**: Click the "Toggle Input" button to reveal the Standard Input (stdin) text area.
2. **Providing Input**: Type any data your program expects to read during execution (e.g., numbers for a sum program).
3. **The Protocol**: Behind the scenes, CodeRunner uses a secure Base64 environment protocol:
   - Your code is Base64 encoded and passed as an environment variable to the sandbox.
   - The entire standard input (stdin) stream is reserved exclusively for your program's input.
   - This ensures that programs using `input()`, `scanf`, or `readline` work perfectly with any amount of data.

### 🚀 Execution & Results
1. **Run Button**: Click "Run Code" to trigger an asynchronous execution task.
2. **Real-time Status**: The UI will poll for results (`pending` -> `running` -> `completed`).
3. **Output Display**: Once finished, `stdout` (normal output) and `stderr` (errors) are displayed in the output console.

### 📂 Managing Projects
- **Save Code**: Logged-in users can save their code snippets as "Projects" in their workspace.
- **History**: Access previously run jobs and saved projects from the "History" dashboard.

---

## 🛡️ Troubleshooting & Maintenance

### 1. Backend Connectivity Issues
If you encounter a `500 Internal Server Error` or "NoneType" error:
- **Check MongoDB Status**: Run `docker logs projecct-mca_mongodb_1`. Ensure it says "waiting for connections".
- **Database Retry**: The Flask backend has built-in retry logic. If the DB is slow to start, wait 10 seconds and refresh.
- **Initialization**: Check `docker logs projecct-mca_backend_1` for "Successfully connected to MongoDB".

### 2. Execution Stuck at "Pending"
If code never finishes running:
- **Celery Worker**: Ensure the worker is running with `docker logs projecct-mca_celery_worker_1`.
- **Redis Connection**: Check if Celery is connected to Redis (`Connected to redis://redis:6379/0`).
- **Sandbox Images**: Ensure you built the sandboxes. Run `docker images` to see if `sandbox-python`, `sandbox-node`, etc., exist.

### 3. Nginx 404 or 502 Errors
- **404 on Auth/Submit**: Ensure your Nginx `location` regex includes `auth` and `submit`.
- **502 Bad Gateway**: This usually means the Flask container (Port 5000) is down. Run `docker ps` to check.
- **Static Files Not Loading**: Verify the frontend build path: `ls /var/www/vhosts/frontend/build/index.html`.
