from flask import Flask, render_template, request, jsonify, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
from flask_bcrypt import Bcrypt
import google.generativeai as genai
import speech_recognition as sr
import requests
import os
import re
from datetime import datetime

# --- App Initialization and Configuration ---
app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your_secret_key_here')
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'users.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# --- Extensions Initialization ---
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
login_manager = LoginManager(app)
login_manager.login_view = 'unauthorized'

# --- Gemini API Configuration ---
API_KEY = os.environ.get("GEMINI_API_KEY", "AIzaSyB5hky466Msa9L8OrGHYHyBfmDLdTBL0lg")
try:
    genai.configure(api_key=API_KEY)
    model = genai.GenerativeModel('gemini-1.5-flash')
except Exception as e:
    print(f"Error configuring Gemini API: {e}")
    model = None

# --- Google Sheets Configuration ---
GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbytaAItpV0neRaA8QbK470fWFXmdRDwQ4-JigxB3eLLRPMuY_FzKp6upD2LHPJUHVNNqg/exec"

# --- Database Model ---
class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password_hash = db.Column(db.String(150), nullable=False)

    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# --- MUN Helper Functions ---
MUN_RESOURCES = {
    "UNODC Cybercrime Module": "https://www.unodc.org/e4j/en/mun/crime-prevention/cybercrime.html",
    "Model UN Guide": "https://www.un.org/en/model-united-nations",
    "Diplomacy Handbook": "https://www.un.org/en/diplomacy",
    "Crisis Simulation Guide": "https://www.un.org/en/crisis-simulation"
}

MUN_PROCEDURES = {
    "Points of Order": "Used to address procedural errors during debate",
    "Right of Reply": "Allows a delegate to respond to personal insults",
    "Suspension of Meeting": "Temporarily pauses the meeting for consultations",
    "Adjournment of Meeting": "Ends the current session"
}

def get_mun_response(user_input, user_id):
    """Generate MUN-focused response"""
    if not model:
        return "The AI model is currently unavailable. Please try again later."
    
    personality_prompt = (
        "You are MUN Mentor, an expert assistant for Model United Nations participants. "
        "Specialize in crime prevention, criminal justice, cybercrime, and UNODC topics. "
        "Provide accurate information about UN procedures, country positions, and resolution drafting. "
        "Be diplomatic, formal, and helpful in your responses. Always maintain a professional tone "
        "suitable for international diplomacy simulations.\n\n"
        f"User: {user_input}\nMUN Mentor:"
    )
    try:
        response = model.generate_content(personality_prompt)
        return response.text.strip()
    except Exception as e:
        return f"I'm having trouble responding right now. Please try again later. ({str(e)})"

def recognize_speech():
    """Speech recognition for MUN preparation"""
    recognizer = sr.Recognizer()
    with sr.Microphone() as source:
        print("Listening for MUN speech practice...")
        recognizer.adjust_for_ambient_noise(source, duration=0.5)
        try:
            audio = recognizer.listen(source, timeout=8)
            return recognizer.recognize_google(audio)
        except sr.WaitTimeoutError:
            return "Error: Listening timed out"
        except sr.UnknownValueError:
            return "Error: Could not understand audio"
        except sr.RequestError as e:
            return f"Error: Speech service unavailable ({str(e)})"

# --- Main Routes ---
@app.route('/')
def home():
    """Render MUN assistant interface"""
    return render_template('index.html')

# --- Authentication Routes ---
@app.route('/unauthorized')
def unauthorized():
    return jsonify({"message": "Login required"}), 401

@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"message": "Email and password are required"}), 400
        
    # Validate email format
    if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
        return jsonify({"message": "Invalid email format"}), 400
        
    # Validate password strength
    if len(password) < 8:
        return jsonify({"message": "Password must be at least 8 characters"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"message": "Email already registered"}), 409

    new_user = User(email=email)
    new_user.set_password(password)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"status": "success", "message": "Account created", "email": new_user.email}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    user = User.query.filter_by(email=email).first()
    
    if user and user.check_password(password):
        login_user(user)
        return jsonify({"status": "success", "message": "Login successful", "email": user.email}), 200
    return jsonify({"message": "Invalid credentials"}), 401

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return jsonify({"status": "success", "message": "Logged out"}), 200

@app.route('/check_auth')
def check_auth():
    if current_user.is_authenticated:
        return jsonify({"logged_in": True, "email": current_user.email})
    return jsonify({"logged_in": False})

# --- Application Feature Routes ---
@app.route('/chat', methods=['POST'])
@login_required
def chat_route():
    user_input = request.json['message']
    response = get_mun_response(user_input, current_user.id)
    return jsonify({'response': response})

@app.route('/voice', methods=['POST'])
@login_required
def voice_input():
    try:
        text = recognize_speech()
        if text.startswith("Error:"):
            return jsonify({'response': text})
        response = get_mun_response(text, current_user.id)
        return jsonify({'response': response, 'text': text})
    except Exception as e:
        return jsonify({'response': f"Voice processing error: {str(e)}"})

@app.route('/register', methods=['POST'])
@login_required
def register_route():
    try:
        data = request.json
        # Add authenticated user's email to registration data
        data['email'] = current_user.email
        
        # Send data to Google Sheets
        response = requests.post(GOOGLE_SCRIPT_URL, json=data)
        
        if response.status_code == 200:
            return jsonify({"status": "success"})
        return jsonify({"status": "error", "message": "Google Sheets error"}), 500
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/resources')
def get_resources():
    return jsonify(MUN_RESOURCES)

@app.route('/procedures')
def get_procedures():
    return jsonify(MUN_PROCEDURES)

# --- App Execution ---
if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # Creates the users.db file and tables if they don't exist
    app.run(debug=True, port=5000)