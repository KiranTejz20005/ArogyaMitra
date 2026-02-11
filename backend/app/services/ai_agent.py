"""Groq LLaMA-3.3-70B for AROMI AI coach."""
import os
from sqlalchemy.orm import Session

from app.models.chat import ChatSession, ChatMessage

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")


def get_ai_response(db: Session, user_id: int, message: str, session_id: int | None = None) -> tuple[str, int]:
    """Get or create session, append user message, call Groq, save assistant reply. Returns (reply, session_id)."""
    if session_id:
        session = db.query(ChatSession).filter(ChatSession.id == session_id, ChatSession.user_id == user_id).first()
        if not session:
            session_id = None
    if not session_id:
        session = ChatSession(user_id=user_id, title=message[:80] or "Chat")
        db.add(session)
        db.commit()
        db.refresh(session)
        session_id = session.id

    user_msg = ChatMessage(session_id=session_id, role="user", content=message)
    db.add(user_msg)
    db.commit()

    # Build context from recent messages
    recent = db.query(ChatMessage).filter(ChatMessage.session_id == session_id).order_by(ChatMessage.created_at.desc()).limit(10).all()
    history = [{"role": m.role, "content": m.content} for m in reversed(recent)]

    reply = _call_groq(history)
    if not reply:
        reply = "I'm sorry, I couldn't generate a response right now. Please check your Groq API key and try again."

    assistant_msg = ChatMessage(session_id=session_id, role="assistant", content=reply)
    db.add(assistant_msg)
    db.commit()
    return reply, session_id


def _call_groq(messages: list[dict]) -> str | None:
    if not GROQ_API_KEY:
        return None
    try:
        from groq import Groq
        client = Groq(api_key=GROQ_API_KEY)
        system = (
            "You are AROMI, the AI health and fitness coach for ArogyaMitra. "
            "Be warm, motivating, and evidence-based. Give concise, actionable advice. "
            "When relevant, consider Indian wellness and cuisine."
        )
        response = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[{"role": "system", "content": system}] + messages,
            max_tokens=1024,
        )
        return (response.choices[0].message.content or "").strip()
    except Exception as e:
        print(f"ERROR: AI Coach (Groq) failed: {e}")
        return None
