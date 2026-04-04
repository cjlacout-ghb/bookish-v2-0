import sqlite3
import os

def migrate():
    db_path = os.path.join(os.path.dirname(__file__), 'bookish.db')
    print(f"Migrating database: {db_path}")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Check current columns in 'libros'
    cursor.execute("PRAGMA table_info(libros)")
    columns = [col[1] for col in cursor.fetchall()]
    print(f"Current columns: {columns}")
    
    # Target columns from models.py
    target_columns = [
        ("formato", "TEXT DEFAULT 'analógico'"),
        ("fecha_inicio", "DATE"),
        ("fecha_fin", "DATE"),
        ("ultima_edicion_anio", "INTEGER"),
        ("ultima_edicion_detalle", "TEXT"),
        ("etiquetas", "TEXT"),
        ("resena", "TEXT")
    ]
    
    for col_name, col_type in target_columns:
        if col_name not in columns:
            try:
                cursor.execute(f"ALTER TABLE libros ADD COLUMN {col_name} {col_type}")
                print(f"Added column: {col_name}")
            except Exception as e:
                print(f"Error adding {col_name}: {e}")
        else:
            print(f"Column {col_name} already exists.")
            
    conn.commit()
    conn.close()
    print("Migration finished.")

if __name__ == "__main__":
    migrate()
