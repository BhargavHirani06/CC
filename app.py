import os
import tempfile
import requests
import speech_recognition as sr
import pyttsx3
from flask import Flask, render_template, request, send_file, jsonify
from pathlib import Path

app = Flask(__name__)
app.config["TEMPLATES_AUTO_RELOAD"] = True

engine = pyttsx3.init()
r = sr.Recognizer()

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/speech-to-text", methods=["POST"])
def speech_to_text():
    audio_file = request.files["file"]
    input_ext = os.path.splitext(audio_file.filename)[1]

    with tempfile.TemporaryDirectory() as temp_dir:
        audio_temp_path = Path(temp_dir) / f"input{input_ext}"
        audio_file.save(str(audio_temp_path))
        
        with sr.AudioFile(str(audio_temp_path)) as source:
            audio_data = r.record(source)
            text = r.recognize_google(audio_data)
            print(f"Recognized text: {text}")

        response = {
            'text': text,
            'filename': 'output.txt',
        }
        return jsonify(response)

@app.route("/text-to-speech", methods=["POST"])
def text_to_speech():
    text_file = request.files["file"]
    text = text_file.read().decode('utf-8')
    engine.save_to_file(text, "output.mp3")
    engine.runAndWait()

    audio_temp_file = tempfile.NamedTemporaryFile(suffix=".mp3", delete=False)
    with open("output.mp3", "rb") as f:
        audio_temp_file.write(f.read())
    audio_temp_file.flush()

    return send_file(audio_temp_file.name, download_name="audio.mp3", as_attachment=True)

if __name__ == "__main__":
    app.run(debug=True)



