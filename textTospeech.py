import os
import json
import base64
import requests
from dotenv import load_dotenv
load_dotenv()

API_KEY = os.getenv("HUME_API_KEY")
if not API_KEY:
    raise RuntimeError("Please set the HUME_API_KEY environment variable")

# Read text + emotion from your JSON file
with open("data.json", "r", encoding="utf-8") as f:
    data = json.load(f)

text = data.get("text")
emotion = data.get("emotion")

if not text or not emotion:
    raise ValueError("Input JSON must include both 'text' and 'emotion' fields")

# Define how to express each emotion
emotion_prompts = {
    "anger": "Speak in a tense, forceful tone with sharp emphasis and intensity.",
    "disgust": "Speak with clear distaste and aversion, as if repulsed by something unpleasant.",
    "fear": "Speak in a trembling, cautious tone with hesitations, as if anxious or scared.",
    "happiness": "Speak with a bright, cheerful tone full of energy and warmth.",
    "neutral": "Speak in a calm, steady, and balanced tone without strong emotion.",
    "sadness": "Speak slowly with a soft, low tone conveying sorrow or disappointment.",
    "surprise": "Speak in an astonished tone, pitch rising with sudden realization or excitement."
}

# Pick acting instructions based on emotion
acting_instruction = emotion_prompts.get(emotion, "Speak in a neutral tone.")

# Select a voice (you can change this later)
voice = {"name": "Ava Song", "provider": "HUME_AI"}

payload = {
    "utterances": [
        {
            "text": text,
            "voice": voice,
            "description": acting_instruction,
        }
    ]
}

headers = {
    "Content-Type": "application/json",
    "X-Hume-Api-Key": API_KEY
}

url = "https://api.hume.ai/v0/tts"
response = requests.post(url, json=payload, headers=headers)
response.raise_for_status()
result = response.json()

# Decode base64 audio and save it
audio_b64 = result["generations"][0]["audio"]
audio_bytes = base64.b64decode(audio_b64)

with open("recording.mp3", "wb") as f:
    f.write(audio_bytes)

print("Saved emotional TTS to recording.mp3")