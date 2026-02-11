"""Run with: python run.py or uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   On Render: PORT is set by the platform; use uvicorn app.main:app --host 0.0.0.0 --port $PORT
"""
import os
import uvicorn

if __name__ == "__main__":
    port = int(os.environ.get("PORT", "8000"))
    reload = not os.environ.get("PORT")
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=port,
        reload=reload,
    )
