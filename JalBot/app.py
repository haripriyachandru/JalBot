import os
import json
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Configure the Gemini API
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Load chat history from a JSON file
def load_chat_history(file_path):
    try:
        with open(file_path, "r") as file:
            return json.load(file)
    except FileNotFoundError:
        print(f"File {file_path} not found. Starting with an empty history.")
        return []

# Save chat history to a file
def save_chat_history(file_path, history):
    with open(file_path, "w") as file:
        json.dump(history, file, indent=4)

# Load predefined history
chat_history_file = "history.json"
chat_history = load_chat_history(chat_history_file)

# Chatbot configuration
generation_config = {
    "temperature": 1,
    "top_p": 0.95,
    "top_k": 40,
    "max_output_tokens": 1000,
    "response_mime_type": "text/plain",
}

model = genai.GenerativeModel(
    model_name="gemini-1.5-pro",
    generation_config=generation_config,
)

# Start chat session with the loaded history
chat_session = model.start_chat(history=chat_history)

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Serve the UI
@app.route("/")
def index():
    return render_template("index.html")

# Chat API endpoint
@app.route("/chat", methods=["POST"])
def chat():
    user_input = request.json.get("message", "")
    if not user_input:
        return jsonify({"error": "Message cannot be empty"}), 400

    # Send user input to the model and get response
    response = chat_session.send_message(user_input)

    # Save the new interaction to the chat history
    chat_history.append({"role": "user", "parts": [user_input]})
    chat_history.append({"role": "model", "parts": [response.text]})
    save_chat_history(chat_history_file, chat_history)

    return jsonify({"response": response.text})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
