import sqlite3

db = r'd:\CJL_temporal\_Apps\Bookish\Bookish_v1-0\backend\bookish.db'
conn = sqlite3.connect(db)
cur = conn.cursor()

# Check columns
cur.execute("PRAGMA table_info(sesiones_lectura)")
cols = [row[1] for row in cur.fetchall()]
print(f"Columns: {cols}")

# Add columns if missing
new_cols = [
    ('is_active', 'INTEGER NOT NULL DEFAULT 0'),
    ('paused_at', 'TEXT'),
    ('pause_offset_seconds', 'INTEGER NOT NULL DEFAULT 0'),
    ('session_note', 'TEXT'),
]

for col, defn in new_cols:
    if col not in cols:
        cur.execute(f"ALTER TABLE sesiones_lectura ADD COLUMN {col} {defn}")
        print(f"Added {col}")

conn.commit()
conn.close()
