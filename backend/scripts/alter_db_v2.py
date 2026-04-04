import sqlite3
import os

def run():
    # Asegurarnos de que estamos en el directorio correcto o usar ruta absoluta
    db_path = os.path.join(os.path.dirname(__file__), 'libros.db')
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        cursor.execute("ALTER TABLE libros ADD COLUMN ultima_edicion_anio INTEGER")
        print("Column 'ultima_edicion_anio' added successfully.")
    except sqlite3.OperationalError:
        print("Column 'ultima_edicion_anio' already exists.")
        
    try:
        cursor.execute("ALTER TABLE libros ADD COLUMN ultima_edicion_detalle TEXT")
        print("Column 'ultima_edicion_detalle' added successfully.")
    except sqlite3.OperationalError:
        print("Column 'ultima_edicion_detalle' already exists.")
        
    conn.commit()
    conn.close()

if __name__ == "__main__":
    run()
