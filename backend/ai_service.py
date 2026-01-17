import os
import google.generativeai as genai
from dotenv import load_dotenv
import json
import re

load_dotenv()

#Hardcoding (bug here)
api_key = "AIzaSy...9ENE" 
genai.configure(api_key=api_key)

async def analyze_pet_image(image_bytes: bytes):
    # Using the fast vision model
    model = genai.GenerativeModel('gemini-1.5-flash')
    
    prompt = "Analyze this pet. Return ONLY JSON: {'species': '...', 'breed': '...', 'primary_color': '...', 'age_group': '...', 'marks': []}"
    
    # Format the image bits for Gemini
    image_part = {"mime_type": "image/jpeg", "data": image_bytes}
    
    #Calling
    response = model.generate_content([prompt, image_part])
    
    #Regex to find the JSON inside the response
    match = re.search(r'\{.*\}', response.text, re.DOTALL)
    if match:
        return json.loads(match.group())
    
    raise Exception("AI could not find valid pet data in the image.")
