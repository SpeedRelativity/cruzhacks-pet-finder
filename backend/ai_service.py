import os
from dotenv import load_dotenv
import json
import re
import base64
import httpx
import time

load_dotenv()

# Get API key from environment variable
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("GEMINI_API_KEY environment variable is not set")

# Use correct Gemini API endpoint format
# The endpoint should be: https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent
GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta"

# #region agent log
_DEBUG_LOG_PATH = "/home/necharkc/cruzhack/.cursor/debug.log"
def _log_debug(payload):
    try:
        os.makedirs(os.path.dirname(_DEBUG_LOG_PATH), exist_ok=True)
        with open(_DEBUG_LOG_PATH, "a", encoding="utf-8") as f:
            f.write(json.dumps(payload) + "\n")
    except Exception as e:
        # Fallback visibility if file write fails
        print(f"DEBUG_LOG_WRITE_FAILED path={_DEBUG_LOG_PATH} error={type(e).__name__}:{str(e)[:120]}")
# #endregion agent log

async def analyze_pet_image(image_bytes: bytes, mime_type: str = "image/jpeg"):
    """
    Analyze pet image using Gemini AI and extract attributes.
    
    Args:
        image_bytes: Image file bytes
        mime_type: MIME type of the image (default: image/jpeg)
    
    Returns:
        dict with species, breed, primary_color, age_group, marks, and size
    """
    # #region agent log
    _log_debug({
        "sessionId": "debug-session",
        "runId": "pre-fix",
        "hypothesisId": "H1",
        "location": "ai_service.py:analyze_pet_image:entry",
        "message": "Analyze image entry",
        "data": {"image_bytes_len": len(image_bytes) if image_bytes else 0, "mime_type": mime_type},
        "timestamp": int(time.time() * 1000)
    })
    # #endregion agent log
    if not api_key:
        raise ValueError("GEMINI_API_KEY is not configured. Cannot analyze image.")
    
    if not image_bytes or len(image_bytes) == 0:
        raise ValueError("Image bytes are empty. Cannot analyze image.")
    
    print(f"🤖 Starting Gemini AI analysis... Image size: {len(image_bytes)} bytes, MIME type: {mime_type}")
    
    try:
        # Try different valid model names (without models/ prefix)
        models_to_try = [
            "gemini-3-flash-preview",
            "gemini-1.5-flash",
            "gemini-1.5-pro",
            "gemini-2.0-flash",
            "gemini-pro",
        ]
        
        prompt = """Analyze this pet image carefully. Return ONLY valid JSON (no markdown, no code blocks, no explanations) with this exact structure:
{
    "species": "Dog or Cat or Bird, etc.",
    "breed": "Specific breed if identifiable, otherwise 'Mixed' or 'Unknown'",
    "primary_color": "Main color (e.g., 'Golden', 'Black', 'White', 'Brown', 'Orange', 'Ginger')",
    "age_group": "Puppy/Kitten, Young, Adult, or Senior",
    "marks": ["distinguishing marks like 'Spotted', 'Striped', 'Floppy ears', 'Short tail', etc."],
    "size": "Small, Medium, or Large"
}

Important: Look at the image carefully. If it's a cat, return "Cat" for species. If it's a dog, return "Dog". Be accurate."""
        
        # Encode image to base64
        image_base64 = base64.b64encode(image_bytes).decode('utf-8')
        
        # Prepare request payload
        payload = {
            "contents": [{
                "parts": [
                    {"text": prompt},
                    {
                        "inline_data": {
                            "mime_type": mime_type if mime_type else "image/jpeg",
                            "data": image_base64
                        }
                    }
                ]
            }]
        }
        
        response_text = None
        last_error = None
        used_model = None
        
        print("📤 Sending request to Gemini API...")
        # #region agent log
        _log_debug({
            "sessionId": "debug-session",
            "runId": "pre-fix",
            "hypothesisId": "H2",
            "location": "ai_service.py:analyze_pet_image:before_request",
            "message": "Prepared Gemini request",
            "data": {"models_to_try": models_to_try, "base_url": GEMINI_BASE_URL},
            "timestamp": int(time.time() * 1000)
        })
        # #endregion agent log
        async with httpx.AsyncClient(timeout=60.0) as client:
            for model_name in models_to_try:
                try:
                    print(f"   Trying model: {model_name}...")
                    # Use correct endpoint format: /models/{model}:generateContent
                    url = f"{GEMINI_BASE_URL}/models/{model_name}:generateContent?key={api_key}"
                    
                    response = await client.post(url, json=payload)
                    
                    if response.status_code == 200:
                        result = response.json()
                        
                        # Extract text from response
                        if not result or "candidates" not in result or len(result["candidates"]) == 0:
                            print(f"   ❌ {model_name}: Empty response structure")
                            last_error = "Empty response structure"
                            continue
                        
                        candidate = result["candidates"][0]
                        if "content" not in candidate or "parts" not in candidate["content"]:
                            print(f"   ❌ {model_name}: Missing content parts")
                            last_error = "Missing content parts"
                            continue
                        
                        parts = candidate["content"]["parts"]
                        if not parts or "text" not in parts[0]:
                            print(f"   ❌ {model_name}: Missing text")
                            last_error = "Missing text in response"
                            continue
                        
                        response_text = parts[0]["text"].strip()
                        # #region agent log
                        _log_debug({
                            "sessionId": "debug-session",
                            "runId": "pre-fix",
                            "hypothesisId": "H3",
                            "location": "ai_service.py:analyze_pet_image:model_success",
                            "message": "Gemini model success",
                            "data": {"model_name": model_name, "response_text_preview": response_text[:120]},
                            "timestamp": int(time.time() * 1000)
                        })
                        # #endregion agent log
                        used_model = model_name
                        print(f"✅ Successfully used model: {model_name}")
                        break
                    else:
                        error_text = response.text[:200] if response.text else "No error text"
                        print(f"   ❌ {model_name} failed: {response.status_code} - {error_text}")
                        last_error = f"HTTP {response.status_code}: {error_text}"
                        # #region agent log
                        _log_debug({
                            "sessionId": "debug-session",
                            "runId": "pre-fix",
                            "hypothesisId": "H1",
                            "location": "ai_service.py:analyze_pet_image:model_http_error",
                            "message": "Gemini model HTTP error",
                            "data": {"model_name": model_name, "status_code": response.status_code, "error_text_preview": error_text[:120]},
                            "timestamp": int(time.time() * 1000)
                        })
                        # #endregion agent log
                        
                except Exception as e:
                    error_msg = str(e)
                    last_error = f"{type(e).__name__}: {error_msg[:150]}"
                    print(f"   ❌ {model_name} error: {error_msg[:100]}")
                    # #region agent log
                    _log_debug({
                        "sessionId": "debug-session",
                        "runId": "pre-fix",
                        "hypothesisId": "H4",
                        "location": "ai_service.py:analyze_pet_image:model_exception",
                        "message": "Gemini model exception",
                        "data": {"model_name": model_name, "error_type": type(e).__name__, "error_msg_preview": error_msg[:120]},
                        "timestamp": int(time.time() * 1000)
                    })
                    # #endregion agent log
                    continue
        
        if response_text is None:
            raise Exception(f"All models failed. Last error: {last_error}")
        
        print(f"📥 Received Gemini response: {response_text[:200]}...")
        
        # Remove markdown code blocks if present
        if response_text.startswith("```"):
            response_text = re.sub(r'^```(?:json)?\s*', '', response_text)
            response_text = re.sub(r'\s*```$', '', response_text)
        
        # Try to find JSON object in response - improved regex with better pattern
        # First try: standard JSON object
        json_match = re.search(r'\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}', response_text, re.DOTALL)
        
        # Second try: any JSON-like structure (more permissive)
        if not json_match:
            json_match = re.search(r'\{[^}]*(?:\{[^}]*\}[^}]*)*\}', response_text, re.DOTALL)
        
        # Third try: simple curly braces
        if not json_match:
            json_match = re.search(r'\{.*?\}', response_text, re.DOTALL | re.MULTILINE)
        
        if json_match:
            json_str = json_match.group()
            try:
                result = json.loads(json_str)
                # Validate and clean the result
                parsed_result = {
                    "species": str(result.get("species", "Unknown")).strip(),
                    "breed": str(result.get("breed", "Unknown")).strip(),
                    "primary_color": str(result.get("primary_color", "Unknown")).strip(),
                    "age_group": str(result.get("age_group", "Unknown")).strip(),
                    "marks": result.get("marks", []) if isinstance(result.get("marks"), list) else [],
                    "size": str(result.get("size", "Unknown")).strip()
                }
                print(f"✅ Successfully parsed AI result: Species={parsed_result['species']}, Breed={parsed_result['breed']}")
                return parsed_result
            except json.JSONDecodeError as json_err:
                print(f"❌ JSON decode error: {json_err}")
                print(f"   Attempted to parse: {json_str[:300]}")
                print(f"   Full response was: {response_text[:500]}")
                # Try to extract fields manually as last resort
                try:
                    # Manual extraction as fallback
                    species_match = re.search(r'"species"\s*:\s*"([^"]+)"', response_text, re.IGNORECASE)
                    breed_match = re.search(r'"breed"\s*:\s*"([^"]+)"', response_text, re.IGNORECASE)
                    color_match = re.search(r'"primary_color"\s*:\s*"([^"]+)"', response_text, re.IGNORECASE)
                    
                    if species_match:
                        parsed_result = {
                            "species": species_match.group(1),
                            "breed": breed_match.group(1) if breed_match else "Unknown",
                            "primary_color": color_match.group(1) if color_match else "Unknown",
                            "age_group": "Unknown",
                            "marks": [],
                            "size": "Unknown"
                        }
                        print(f"✅ Extracted fields manually: {parsed_result}")
                        return parsed_result
                except:
                    pass
                raise Exception(f"Failed to parse JSON from AI response: {str(json_err)}")
        else:
            print(f"❌ No JSON found in response.")
            print(f"   Full response (first 500 chars): {response_text[:500]}")
            raise Exception(f"AI did not return valid JSON. Response: {response_text[:300]}")
            
    except ValueError as ve:
        print(f"❌ Configuration error: {str(ve)}")
        raise
    except Exception as e:
        error_msg = str(e)
        print(f"❌ Gemini API error: {error_msg}")
        print(f"   Error type: {type(e).__name__}")
        # Don't suppress the error - let it propagate so we know what went wrong
        raise Exception(f"Gemini AI analysis failed: {error_msg}")
