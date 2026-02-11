import os
import json
import logging
from typing import Dict, Any, List, Optional
from groq import Groq

logger = logging.getLogger(__name__)

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None

def get_ai_response(messages: List[Dict[str, str]], model: str = "llama-3.3-70b-versatile") -> str:
    """Get a chat completion from Groq"""
    if not client:
        logger.warning("GROQ_API_KEY not found in environment")
        return "AI response unavailable: API key missing."
    
    try:
        completion = client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=0.7,
            max_tokens=1024,
        )
        return completion.choices[0].message.content
    except Exception as e:
        logger.error(f"Groq API error: {e}")
        return f"Error connecting to AI service: {str(e)}"

def generate_health_summary(data: Dict[str, Any]) -> str:
    """Generate a summary of user's health metrics"""
    prompt = f"Analyze these health metrics and provide a brief, professional summary: {json.dumps(data)}"
    messages = [{"role": "user", "content": prompt}]
    return get_ai_response(messages)
