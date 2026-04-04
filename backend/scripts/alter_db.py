import sqlite3

conn = sqlite3.connect("bookish.db")
cursor = conn.cursor()
try:
    cursor.execute("ALTER TABLE libros ADD COLUMN fecha_inicio DATE;")
    print("Column fecha_inicio added successfully.")
except Exception as e:
    print("Error:", e)

try:
    cursor.execute("ALTER TABLE libros ADD COLUMN fecha_fin DATE;")
    print("Column fecha_fin added successfully.")
except Exception as e:
    print("Error:", e)

conn.commit()
conn.close()
