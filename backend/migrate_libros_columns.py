import sqlite3
import os
import sys

# Import config to get the real path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
import config

db_path = os.path.join(config.DATA_DIR, 'bookish.db')
print(f"Migrating database at: {db_path}")

if not os.path.exists(db_path):
    print("Database not found!")
    sys.exit(1)

conn = sqlite3.connect(db_path)
cur = conn.cursor()

# Get current columns
cur.execute("PRAGMA table_info(libros)")
cols = {row[1]: row for row in cur.fetchall()}

# 1. Rename 'anio' to 'primera_edicion_anio' if 'primera_edicion_anio' doesn't exist
if 'primera_edicion_anio' not in cols:
    if 'anio' in cols:
        print("Renaming 'anio' to 'primera_edicion_anio'...")
        try:
            cur.execute("ALTER TABLE libros RENAME COLUMN anio TO primera_edicion_anio")
        except sqlite3.OperationalError:
            # Fallback if RENAME COLUMN is not supported
            print("Fallback: Adding 'primera_edicion_anio' and copying data...")
            cur.execute("ALTER TABLE libros ADD COLUMN primera_edicion_anio INTEGER")
            cur.execute("UPDATE libros SET primera_edicion_anio = anio")
    else:
        print("Adding 'primera_edicion_anio' column...")
        cur.execute("ALTER TABLE libros ADD COLUMN primera_edicion_anio INTEGER")

# 2. Rename 'ultima_edicion_detalle' to 'actual_edicion_anio' if it doesn't exist
if 'actual_edicion_anio' not in cols:
    if 'ultima_edicion_detalle' in cols:
        print("Renaming 'ultima_edicion_detalle' to 'actual_edicion_anio'...")
        try:
            cur.execute("ALTER TABLE libros RENAME COLUMN ultima_edicion_detalle TO actual_edicion_anio")
        except sqlite3.OperationalError:
            print("Fallback: Adding 'actual_edicion_anio' and copying data...")
            cur.execute("ALTER TABLE libros ADD COLUMN actual_edicion_anio INTEGER")
            # Try to cast detail to int if it's just a year string
            cur.execute("UPDATE libros SET actual_edicion_anio = CAST(ultima_edicion_detalle AS INTEGER)")
    else:
        print("Adding 'actual_edicion_anio' column...")
        cur.execute("ALTER TABLE libros ADD COLUMN actual_edicion_anio INTEGER")

# 3. Ensure 'ultima_edicion_anio' exists (it should, but just in case)
if 'ultima_edicion_anio' not in cols:
    print("Adding 'ultima_edicion_anio' column...")
    cur.execute("ALTER TABLE libros ADD COLUMN ultima_edicion_anio INTEGER")

conn.commit()
conn.close()
print("Migration completed successfully.")
