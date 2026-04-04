import sqlite3
import os

db_path = r'd:\CJL_temporal\_Apps\Bookish\Bookish_v1-0\backend\bookish.db'
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
    print("Database file NOT FOUND at " + db_path)
