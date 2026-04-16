import sqlite3
import os

db_path = 'bookish.db'
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    cur.execute("PRAGMA table_info(libros)")
    columns = cur.fetchall()
    print("Columns in 'libros':")
    for col in columns:
        print(col)
    conn.close()
else:
    print(f"Database file NOT FOUND at {os.path.abspath(db_path)}")
