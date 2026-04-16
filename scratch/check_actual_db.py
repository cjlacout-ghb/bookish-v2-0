import sqlite3
import os
import sys

def get_data_dir():
    home = os.path.expanduser("~")
    if sys.platform == "win32":
        try:
            import ctypes
            from ctypes import wintypes
            buf = ctypes.create_unicode_buffer(wintypes.MAX_PATH)
            ctypes.windll.shell32.SHGetFolderPathW(None, 5, None, 0, buf)
            documents = buf.value
        except Exception:
            documents = os.path.join(home, "Documents")
        return os.path.join(documents, "Bookish", "data")
    return os.path.join(home, "Documents", "Bookish", "data")

data_dir = get_data_dir()
db_path = os.path.join(data_dir, 'bookish.db')

print(f"Checking actual database at: {db_path}")
if not os.path.exists(db_path):
    print("Database not found in Documents.")
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
