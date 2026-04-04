import sqlite3

db_path = r'd:\CJL_temporal\_Apps\Bookish\Bookish_v1-0\backend\bookish.db'
conn = sqlite3.connect(db_path)
cur = conn.cursor()
cur.execute("SELECT id, titulo, paginas, pagina_actual FROM libros ORDER BY creado_en DESC")
rows = cur.fetchall()
print("Latest books in DB:")
for r in rows:
    print(r)
conn.close()
