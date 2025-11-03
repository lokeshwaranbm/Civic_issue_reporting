# blip_classify.py
import sys
from transformers import BlipProcessor, BlipForConditionalGeneration
from PIL import Image

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

    # Public Safety
    "accident": "Accident Spot",
    "fire": "Fire Hazard",
    "theft": "Public Safety Concern",

     # Infrastructure
    "building": "Illegal Construction",
    "encroachment": "Illegal Construction",
    "collapse": "Building Collapse",
    "bridge": "Damaged Bridge",
    "footpath": "Damaged Footpath",
    "sidewalk": "Damaged Footpath",

    # Environment
    "tree": "Fallen Tree",
    "branch": "Fallen Tree",
    "pollution": "Air Pollution",
    "smoke": "Air Pollution",
    "noise": "Noise Pollution"
}


image_path = sys.argv[1]

processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base")
model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-base")

image = Image.open(image_path).convert("RGB")
inputs = processor(image, return_tensors="pt")
outputs = model.generate(**inputs)
caption = processor.decode(outputs[0], skip_special_tokens=True)

# Simple keyword-based classification
category = "Others"
for keyword, issue in civic_issues.items():
    if keyword.lower() in caption.lower():
        category = issue
        break

print(category)
