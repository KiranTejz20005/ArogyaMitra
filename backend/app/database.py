"""
ArogyaMitra - SQLite database with SQLAlchemy ORM.
"""
import os
from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./arogyamitra.db")

# SQLite needs check_same_thread=False for FastAPI
connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args["check_same_thread"] = False

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    echo=os.getenv("DEBUG", "false").lower() == "true",
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """Dependency for FastAPI routes."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Create all tables. Call on startup."""
    from app.models import user, workout, nutrition, progress, health, chat  # noqa: F401
    Base.metadata.create_all(bind=engine)
    # SQLite migrations: add columns/tables if missing
    if DATABASE_URL.startswith("sqlite"):
        with engine.connect() as conn:
            r = conn.execute(text("SELECT 1 FROM pragma_table_info('workout_plans') WHERE name='plan_data'"))
            if r.fetchone() is None:
                conn.execute(text("ALTER TABLE workout_plans ADD COLUMN plan_data TEXT"))
                conn.commit()
            # Meals: add nutrition_plan_id and day_of_week if missing
            r2 = conn.execute(text("SELECT 1 FROM pragma_table_info('meals') WHERE name='nutrition_plan_id'"))
            if r2.fetchone() is None:
                try:
                    conn.execute(text("ALTER TABLE meals ADD COLUMN nutrition_plan_id INTEGER REFERENCES nutrition_plans(id)"))
                except Exception:
                    conn.execute(text("ALTER TABLE meals ADD COLUMN nutrition_plan_id INTEGER"))
                conn.commit()
            r3 = conn.execute(text("SELECT 1 FROM pragma_table_info('meals') WHERE name='day_of_week'"))
            if r3.fetchone() is None:
                conn.execute(text("ALTER TABLE meals ADD COLUMN day_of_week VARCHAR(20)"))
                conn.commit()
            # Health assessments: add optional columns if missing
            for col, ctype in [
                ("age", "INTEGER"), ("gender", "VARCHAR(20)"), ("height_cm", "REAL"),
                ("weight_kg", "REAL"), ("bmi", "REAL"), ("bmi_category", "VARCHAR(50)"),
                ("health_conditions", "TEXT"), ("injuries", "TEXT"), ("sleep_hours", "REAL"),
                ("stress_level", "VARCHAR(50)"), ("activity_level", "VARCHAR(50)"),
                ("fitness_goal", "VARCHAR(100)"), ("fitness_level", "VARCHAR(50)"),
                ("workout_preference", "VARCHAR(50)"), ("workout_time_preference", "VARCHAR(50)"),
                ("dietary_preference", "VARCHAR(100)"), ("notes", "TEXT")
            ]:
                r = conn.execute(text(f"SELECT 1 FROM pragma_table_info('health_assessments') WHERE name='{col}'"))
                if r.fetchone() is None:
                    conn.execute(text(f"ALTER TABLE health_assessments ADD COLUMN {col} {ctype}"))
            
            # Workout plans: add additional columns
            for col, ctype in [
                ("difficulty", "VARCHAR(50)"), ("duration_minutes", "INTEGER"), ("plan_data", "TEXT")
            ]:
                r = conn.execute(text(f"SELECT 1 FROM pragma_table_info('workout_plans') WHERE name='{col}'"))
                if r.fetchone() is None:
                    conn.execute(text(f"ALTER TABLE workout_plans ADD COLUMN {col} {ctype}"))

            # Workouts: add columns
            for col, ctype in [
                ("completed_at", "DATETIME"), ("duration_minutes", "INTEGER"), ("notes", "TEXT")
            ]:
                r = conn.execute(text(f"SELECT 1 FROM pragma_table_info('workouts') WHERE name='{col}'"))
                if r.fetchone() is None:
                    conn.execute(text(f"ALTER TABLE workouts ADD COLUMN {col} {ctype}"))
            
            conn.commit()
