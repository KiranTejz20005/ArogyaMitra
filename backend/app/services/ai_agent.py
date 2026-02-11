import os
import json
import logging
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
_client: Optional[Any] = None

def _get_client() -> Optional[Any]:
    """Lazy-init Groq client to avoid import-time errors (e.g. httpx proxies compatibility on Render)."""
    global _client
    if _client is not None:
        return _client
    if not GROQ_API_KEY:
        return None
    try:
        from groq import Groq
        _client = Groq(api_key=GROQ_API_KEY)
        return _client
    except TypeError as e:
        logger.warning("Groq client init failed (e.g. httpx version): %s", e)
        return None
    except Exception as e:
        logger.warning("Groq client init failed: %s", e)
        return None

def get_ai_response(messages: List[Dict[str, str]], model: str = "llama-3.3-70b-versatile") -> str:
    """Get a chat completion from Groq"""
    client = _get_client()
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
