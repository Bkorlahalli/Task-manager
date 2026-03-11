"""
Task Manager - Python API Gateway
Flow: Client → Python Gateway → Java Backend → PostgreSQL / Redis
"""
import logging
import os
import requests
from flask import Flask, request, jsonify, send_from_directory

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__, static_folder="static", static_url_path="/static")

JAVA_BACKEND_URL = os.getenv("JAVA_BACKEND_URL", "http://java-backend:8080")


@app.route("/")
def index():
    """Serve the Task Manager frontend."""
    return send_from_directory(app.static_folder, "index.html")


def _call_backend(method, path, json_data=None):
    """Call Java backend with error handling."""
    url = f"{JAVA_BACKEND_URL}{path}"
    try:
        if method == "GET":
            resp = requests.get(url, timeout=10)
        elif method == "POST":
            resp = requests.post(url, json=json_data or {}, timeout=10)
        elif method == "PUT":
            resp = requests.put(url, json=json_data or {}, timeout=10)
        elif method == "DELETE":
            resp = requests.delete(url, timeout=10)
        else:
            return None, 405

        try:
            data = resp.json() if resp.content else None
        except ValueError:
            data = resp.text

        return data, resp.status_code
    except requests.ConnectionError as e:
        logger.error("Connection to Java backend failed: %s", e)
        return {"error": "Backend service unavailable"}, 503
    except requests.Timeout:
        logger.error("Backend request timeout")
        return {"error": "Backend timeout"}, 504
    except requests.RequestException as e:
        logger.error("Backend request failed: %s", e)
        return {"error": str(e)}, 502


@app.route("/task", methods=["POST"])
def create_task():
    """Create a new task."""
    data = request.get_json() or {}
    if not data.get("title"):
        return jsonify({"error": "title is required"}), 400
    if "status" not in data:
        data["status"] = "TODO"
    result, status = _call_backend("POST", "/tasks", data)
    return jsonify(result), status


@app.route("/tasks")
def get_tasks():
    """Get all tasks (cached in Redis by Java backend)."""
    result, status = _call_backend("GET", "/tasks")
    return jsonify(result), status


@app.route("/task/<int:task_id>")
def get_task(task_id):
    """Get task by ID."""
    result, status = _call_backend("GET", f"/tasks/{task_id}")
    return jsonify(result), status


@app.route("/task/<int:task_id>", methods=["PUT"])
def update_task(task_id):
    """Update task by ID."""
    data = request.get_json() or {}
    result, status = _call_backend("PUT", f"/tasks/{task_id}", data)
    return jsonify(result), status


@app.route("/task/<int:task_id>", methods=["DELETE"])
def delete_task(task_id):
    """Delete task by ID."""
    result, status = _call_backend("DELETE", f"/tasks/{task_id}")
    if status == 204:
        return "", 204
    return jsonify(result or {}), status


@app.route("/health")
def health():
    """Health check."""
    return jsonify({"status": "ok", "service": "python-gateway"}), 200


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)
