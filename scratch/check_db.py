import sqlite3
import os

db_path = os.path.join('backend', 'bookish.db')
if not os.path.exists(db_path):
    print(f"Database not found at {db_path}")
else:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT id, titulo, portada_filename FROM libros")
        rows = cursor.fetchall()
        for row in rows:
            print(f"ID: {row[0]}, Titulo: {row[1]}, Portada: {row[2]}")
    except Exception as e:
        print(f"Error: {e}")
    conn.close()
