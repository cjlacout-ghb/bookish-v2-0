import sqlite3

db_path = r'd:\CJL_temporal\_Apps\Bookish\Bookish_v1-0\backend\bookish.db'
conn = sqlite3.connect(db_path)
conn.row_factory = sqlite3.Row
cur = conn.cursor()
cur.execute("SELECT * FROM libros WHERE titulo LIKE '%paciente%'")
row = cur.fetchone()
if row:
    print("Columns for 'paciente':")
    for key in row.keys():
        print(f"{key}: {row[key]} ({type(row[key])})")
else:
    print("Book NOT FOUND")
conn.close()
