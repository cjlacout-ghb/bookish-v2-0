"""
migrate_sessions.py — safely add Stage 1.5 columns to sesiones_lectura.
Run once. Existing data is preserved.
"""
import sqlite3
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "backend", "bookish.db")

COLUMNS_TO_ADD = [
    ("is_active",             "INTEGER NOT NULL DEFAULT 0"),
    ("paused_at",             "TEXT"),
    ("pause_offset_seconds",  "INTEGER NOT NULL DEFAULT 0"),
    ("session_note",          "TEXT"),
]

def migrate():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    cur.execute("PRAGMA table_info(sesiones_lectura)")
    existing = {row[1] for row in cur.fetchall()}

    added = []
    for col_name, col_def in COLUMNS_TO_ADD:
        if col_name not in existing:
            cur.execute(f"ALTER TABLE sesiones_lectura ADD COLUMN {col_name} {col_def}")
            added.append(col_name)

    conn.commit()
    conn.close()

    if added:
        print(f"✔  Migración completada. Columnas añadidas: {', '.join(added)}")
    else:
        print("✔  La tabla ya está actualizada. Nada que migrar.")

if __name__ == "__main__":
    migrate()
