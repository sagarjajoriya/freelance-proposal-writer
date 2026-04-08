import os
import time
from collections import defaultdict, deque

from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
from groq import Groq

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/generate": {"origins": os.getenv("FRONTEND_ORIGIN", "*")}})

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

REQUEST_WINDOW_SECONDS = 60
MAX_REQUESTS_PER_WINDOW = 5
request_log = defaultdict(deque)


def is_rate_limited(ip_address: str) -> bool:
    now = time.time()
    attempts = request_log[ip_address]

    while attempts and now - attempts[0] > REQUEST_WINDOW_SECONDS:
        attempts.popleft()

    if len(attempts) >= MAX_REQUESTS_PER_WINDOW:
        return True

    attempts.append(now)
    return False


def validate_payload(payload):
    required_fields = ["jobDescription", "name", "skills", "experienceLevel"]
    missing = [field for field in required_fields if not str(payload.get(field, "")).strip()]

    if missing:
        return f"Missing required fields: {', '.join(missing)}"

    return None


def build_prompt(payload):
    return f"""You are a top-rated freelancer with a track record of winning projects on Upwork and Fiverr.

Task: Write a personalized proposal that maximizes the chance of getting hired.

Requirements:
1. Hook: Start with a strong, engaging opening line. Do NOT use "Dear Sir/Madam".
2. Relevance: Reference specific requirements from the job description.
3. Tone: Professional, confident, and friendly.
4. Length: 150-250 words.
5. Skills: Highlight the freelancer's relevant skills naturally.
6. Questions: Include 1-2 thoughtful questions.
7. CTA: End with a confident call to action.
8. Customization: Incorporate the freelancer's name, experience level, and key skills.

Additional Preferences:
- Preferred tone: {payload.get("tone", "Professional")}
- Word count target: {payload.get("wordRange", "150-250")} words

Input Data:
Job Description: {payload["jobDescription"]}
Freelancer Details:
Name: {payload["name"]}
Skills: {payload["skills"]}
Experience Level: {payload["experienceLevel"]}
"""


def generate_proposal_response(payload, ip_address):
    if not os.getenv("GROQ_API_KEY"):
        return {"error": "Server is missing GROQ_API_KEY."}, 500

    if is_rate_limited(ip_address):
        return {"error": "Rate limit exceeded. Try again in a minute."}, 429

    validation_error = validate_payload(payload)
    if validation_error:
        return {"error": validation_error}, 400

    try:
        response = client.chat.completions.create(
            model=os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile"),
            messages=[
                {
                    "role": "user",
                    "content": build_prompt(payload),
                }
            ],
        )
        proposal = (response.choices[0].message.content or "").strip()
        return {"proposal": proposal}, 200
    except Exception as exc:
        return {"error": f"Proposal generation failed: {exc}"}, 500


@app.post("/generate")
def generate_proposal():
    payload = request.get_json(silent=True) or {}
    ip_address = request.headers.get("X-Forwarded-For", request.remote_addr or "unknown")
    body, status_code = generate_proposal_response(payload, ip_address)
    return jsonify(body), status_code


@app.get("/health")
def health_check():
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
