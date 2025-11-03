from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import BlipProcessor, BlipForConditionalGeneration
from PIL import Image
import io

app = Flask(__name__)
CORS(app)

# Initialize BLIP model
processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base")
model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-base")

# Define simple civic issue keywords
civic_issues = {
    # Roads & Transport
    "pothole": "Pothole",
    "road": "Pothole",
    "crack": "Pothole",
    "damaged_road": "Pothole",
    "speedbreaker": "Improper Speedbreaker",
    "signal": "Traffic Signal Issue",
    "traffic_light": "Traffic Signal Issue",

    # Waste Management
    "garbage": "Garbage",
    "trash": "Garbage",
    "dump": "Garbage",
    "waste": "Garbage",
    "sewage": "Sewage Overflow",

    # Lighting
    "streetlight": "Broken Streetlight",
    "lamp": "Broken Streetlight",
    "pole": "Broken Streetlight",
    "dark": "Broken Streetlight",

    # Water Issues
    "water": "Waterlogging",
    "flood": "Waterlogging",
    "drain": "Drainage Blockage",
    "clog": "Drainage Blockage",
    "leak": "Water Pipe Leakage",
    "plastic": "Plastic Pollution in Water",
    "river": "Plastic Pollution in Water",
    "lake": "Plastic Pollution in Water",
    "bottle": "Plastic Pollution in Water",

     # Infrastructure
    "building": "Illegal Construction",
    "encroachment": "Illegal Construction",
    "collapse": "Building Collapse",
    "bridge": "Damaged Bridge",
    "footpath": "Damaged Footpath",
    "sidewalk": "Damaged Footpath",

    # Public Safety
    "accident": "Accident Spot",
    "fire": "Fire Hazard",
    "theft": "Public Safety Concern",

    # Environment
    "tree": "Fallen Tree",
    "branch": "Fallen Tree",
    "pollution": "Air Pollution",
    "smoke": "Air Pollution",
    "noise": "Noise Pollution"
}


@app.route("/classify", methods=["POST"])
def classify_image():
    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    # Read image
    file = request.files["image"]
    image = Image.open(io.BytesIO(file.read())).convert("RGB")

    # Generate caption
    inputs = processor(image, return_tensors="pt")
    outputs = model.generate(**inputs)
    caption = processor.decode(outputs[0], skip_special_tokens=True)

    # Simple keyword-based classification
    category = None # Initialize category as None
    for keyword, issue in civic_issues.items():
        if keyword.lower() in caption.lower():
            category = issue
            break # Stop after finding the first match

    # If no keyword was found, category will still be None
    if category is None:
        # *THIS IS THE MODIFIED PART*
        # Return a clearer error message and remove the unhelpful caption.
        return jsonify({
            "error": "This does not look like a civic issue. Please upload a different picture."
        }), 400 # Return a 'Bad Request' status

    return jsonify({"caption": caption, "category": category})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)