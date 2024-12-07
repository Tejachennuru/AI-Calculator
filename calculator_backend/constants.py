from dotenv import load_dotenv
import os

load_dotenv()

SERVER_URL = "127.0.0.1"  # Use localhost
PORT = 8900               # Backend port
ENV = "dev"               # Environment: "dev" or "production"
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")  # Gemini API Key
