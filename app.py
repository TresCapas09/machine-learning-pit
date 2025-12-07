import os
import numpy as np
from flask import Flask, request, jsonify, render_template
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import img_to_array
from PIL import Image
import io

# ================================
# FLASK INITIALIZATION
# ================================
app = Flask(__name__)

# ================================
# MODEL + PREPROCESS PARAMETERS
# ================================
IMG_HEIGHT, IMG_WIDTH = 224, 224

NOT_LEAF_THRESHOLD = 0.42          # low confidence = not a leaf
HEALTHY_CLASS_THRESHOLD = 0.75      # 75% healthy threshold
MIN_GREEN_RATIO = 0.12              # green pixel ratio

# Load model ONCE
MODEL = load_model("final_potato_model_v2.keras")

CLASS_LABELS = {
    0: "potato_early_blight",
    1: "potato_healthy",
    2: "potato_late_blight"
}

# ================================
# GREEN RATIO FILTER
# ================================
def compute_green_ratio(pil_img):
    arr = np.array(pil_img)
    if arr.ndim != 3 or arr.shape[2] != 3:
        return 0.0

    r = arr[:, :, 0].astype(np.int16)
    g = arr[:, :, 1].astype(np.int16)
    b = arr[:, :, 2].astype(np.int16)

    green_mask = (g > r) & (g > b)
    green_pixels = np.count_nonzero(green_mask)
    total_pixels = arr.shape[0] * arr.shape[1]

    return green_pixels / float(total_pixels)


# ================================
# ZOOM / CROP FUNCTION
# ================================
def make_zoom_crops(pil_img, zoom_factors=(1.0, 0.9, 0.8, 0.7)):
    w, h = pil_img.size
    crops = []

    for z in zoom_factors:
        z = float(z)
        if z <= 0 or z > 1:
            continue

        new_w = int(w * z)
        new_h = int(h * z)

        left = (w - new_w) // 2
        upper = (h - new_h) // 2
        right = left + new_w
        lower = upper + new_h

        crop = pil_img.crop((left, upper, right, lower))
        crop = crop.resize((IMG_WIDTH, IMG_HEIGHT), Image.Resampling.LANCZOS)

        arr = img_to_array(crop).astype("float32") / 255.0
        crops.append(arr)

    return np.stack(crops, axis=0)  # (N, 224, 224, 3)


# ================================
# ROUTES
# ================================
@app.route("/")
def index():
    return render_template("index.html")


@app.route("/predict", methods=["POST"])
def predict():
    if "image" not in request.files:
        return jsonify({"error": "No image uploaded."}), 400

    file = request.files["image"]
    img = Image.open(io.BytesIO(file.read())).convert("RGB")

    # ================================
    # Step 1 — GREEN CONTENT CHECK
    # ================================
    green_ratio = compute_green_ratio(img)

    if green_ratio < MIN_GREEN_RATIO:
        return jsonify({
            "prediction": "not_leaf",
            "message": "Image has too little green content. Possibly NOT a potato leaf.",
            "green_ratio": float(green_ratio)
        })

    # ================================
    # Step 2 — Build multi-zoom inputs
    # ================================
    zoom_factors = (1.0, 0.9, 0.8, 0.7)
    input_batch = make_zoom_crops(img, zoom_factors)

    # ================================
    # Step 3 — Predict using ensemble
    # ================================
    predictions = MODEL.predict(input_batch, verbose=0)
    predictions_mean = predictions.mean(axis=0)

    early_prob, healthy_prob, late_prob = map(float, predictions_mean)
    final_idx = int(np.argmax(predictions_mean))
    final_prob = float(predictions_mean[final_idx])
    raw_top_class = CLASS_LABELS[final_idx]

    # ================================
    # Step 4 — Low confidence = not a leaf
    # ================================
    if final_prob < NOT_LEAF_THRESHOLD:
        return jsonify({
            "prediction": "not_leaf",
            "message": "Model not confident this is a potato leaf.",
            "confidence": final_prob,
        })

    # ================================
    # Step 5 — Healthy threshold logic
    # ================================
    final_label = raw_top_class

    if raw_top_class == "potato_healthy":
        if healthy_prob < HEALTHY_CLASS_THRESHOLD:
            final_label = "potato_early_blight" if early_prob >= late_prob else "potato_late_blight"

    # Convert to friendly label
    readable_label = {
        "potato_early_blight": "Early Blight",
        "potato_healthy": "Healthy",
        "potato_late_blight": "Late Blight"
    }[final_label]

    # ================================
    # RETURN JSON RESULT
    # ================================
    return jsonify({
        "final_prediction": final_label,
        "readable_prediction": readable_label,
        "confidence": final_prob,
    })


# ================================
# MAIN - uncomment to debug locally
# ================================
#if __name__ == "__main__":
#    app.run(debug=True)