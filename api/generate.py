import os

from flask import Flask, jsonify, request
from flask_cors import CORS

from backend.app import generate_proposal_response

app = Flask(__name__)
CORS(app, resources={r"/": {"origins": os.getenv("FRONTEND_ORIGIN", "*")}})


@app.post("/")
def generate():
    payload = request.get_json(silent=True) or {}
    ip_address = request.headers.get("X-Forwarded-For", request.remote_addr or "unknown")
    body, status_code = generate_proposal_response(payload, ip_address)
    return jsonify(body), status_code
