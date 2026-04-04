import sqlite3

db_path = r'd:\CJL_temporal\_Apps\Bookish\Bookish_v1-0\backend\bookish.db'
conn = sqlite3.connect(db_path)
cur = conn.cursor()
cur.execute("UPDATE libros SET paginas = 320 WHERE id = 4")
conn.commit()
print("Updated ID 4 with paginas = 320")
conn.close()
