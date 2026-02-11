import sqlite3
import os

db_path = "backend/arogyamitra.db"
if not os.path.exists(db_path):
    print(f"Database {db_path} not found.")
    exit(1)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

tables = ["health_assessments", "workout_plans", "workouts", "meals"]
for table in tables:
    print(f"\nTable: {table}")
    cursor.execute(f"PRAGMA table_info({table})")
    columns = [row[1] for row in cursor.fetchall()]
    print(f"Columns: {', '.join(columns)}")

conn.close()
