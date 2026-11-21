from pathlib import Path

import cv2
import numpy as np
from flask import Flask, jsonify, request
from tf_keras.models import load_model

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 2 * 1024 * 1024

model_dir = Path(__file__).resolve().parent
cascade_dir = model_dir / "haarcascade_files"
face_cascade = cv2.CascadeClassifier(str(cascade_dir / "haarcascade_frontalface_default.xml"))
eye_cascade = cv2.CascadeClassifier(str(cascade_dir / "haarcascade_eye.xml"))
distraction_model = load_model(model_dir / "cnn" / "distraction_model.hdf5", compile=False)


def classify_frame(frame):
    normalized_width = 1200
    height, width = frame.shape[:2]
    frame = cv2.resize(frame, (normalized_width, max(1, round(height * normalized_width / width))))
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(
        gray, scaleFactor=1.1, minNeighbors=5, minSize=(240, 240)
    )
    if len(faces) == 0:
        return "unavailable"

    x, y, w, h = max(faces, key=lambda bounds: bounds[2] * bounds[3])
    face_gray = gray[y:y + h, x:x + w]
    face_color = frame[y:y + h, x:x + w]
    eyes = eye_cascade.detectMultiScale(
        face_gray, scaleFactor=1.1, minNeighbors=5, minSize=(60, 60)
    )
    if len(eyes) == 0:
        return "unavailable"

    eye_patches = [
        cv2.resize(face_color[ey:ey + eh, ex:ex + ew], (64, 64))
        for ex, ey, ew, eh in eyes
    ]
    batch = np.asarray(eye_patches, dtype=np.float32) / 255.0
    score = float(np.mean(distraction_model(batch, training=False).numpy()))
    if not np.isfinite(score):
        return "unavailable"
    return "focused" if score > 0.5 else "distracted"


@app.get("/health")
def health():
    return jsonify(status="ready")


@app.post("/process_image")
def process_image():
    upload = request.files.get("image")
    if upload is None:
        return jsonify(error="Upload an image in the image field."), 400

    encoded = np.frombuffer(upload.read(), dtype=np.uint8)
    frame = cv2.imdecode(encoded, cv2.IMREAD_COLOR) if encoded.size else None
    if frame is None:
        return jsonify(error="The image could not be decoded."), 400

    return jsonify(result=classify_frame(frame))


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000)
