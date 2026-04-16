import os
import sqlite3
import shutil
import sys

def get_db_path():
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
    else:
        documents = os.path.join(home, "Documents")
    return os.path.join(documents, "Bookish", "data", "bookish.db")

def normalize(text):
    return "".join(c.lower() for c in text if c.isalnum())

def sync_dev():
    db_path = get_db_path()
    # Carpeta de desarrollo
    dev_covers = os.path.join(os.getcwd(), "backend", "covers")

    print(f"Sincronizando carpeta de desarrollo: {dev_covers}")
    
    if not os.path.exists(db_path):
        print("No se encontró la DB oficial en Documentos.")
        return

    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    cur.execute("SELECT id, titulo, portada_filename FROM libros")
    libros = cur.fetchall()

    files_in_dev = os.listdir(dev_covers)
    
    for _, titulo, uuid_filename in libros:
        if not uuid_filename: continue
        
        # Si el archivo con el nombre UUID ya existe, saltar
        if os.path.exists(os.path.join(dev_covers, uuid_filename)):
            continue
            
        # Buscar el archivo legible que coincida con el título
        norm_titulo = normalize(titulo)
        matched_file = None
        for f in files_in_dev:
            # Evitar matchear archivos que ya son UUIDs
            if len(f.split('.')[0]) == 32: continue 
            
            if norm_titulo in normalize(f):
                matched_file = f
                break
        
        if matched_file:
            src = os.path.join(dev_covers, matched_file)
            dst = os.path.join(dev_covers, uuid_filename)
            shutil.copy2(src, dst)
            print(f"[*] Habilitando en dev: '{titulo}' -> {uuid_filename}")

    conn.close()
    print("Listo. Refresca el browser.")

if __name__ == "__main__":
    sync_dev()
