import os
import sqlite3
import shutil
import sys
import uuid

def get_paths():
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
    
    data_dir = os.path.join(documents, "Bookish", "data")
    dest_covers = os.path.join(data_dir, "portadas")
    db_path = os.path.join(data_dir, "bookish.db")
    return db_path, dest_covers

def normalize(text):
    return "".join(c.lower() for c in text if c.isalnum())

def run_sync():
    db_path, dest_covers = get_paths()
    source_covers = os.path.join(os.getcwd(), "backend", "covers")

    print(f"--- Sincronizador de Portadas Bookish ---")
    print(f"Origen: {source_covers}")
    print(f"Destino: {dest_covers}")
    print(f"Base de Datos: {db_path}\n")

    if not os.path.exists(dest_covers):
        os.makedirs(dest_covers, exist_ok=True)

    if not os.path.exists(db_path):
        print("ERROR: No se encontró la base de datos en Documentos. ¿Has abierto la app al menos una vez?")
        return

    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    cur.execute("SELECT id, titulo, portada_filename FROM libros")
    libros = cur.fetchall()

    files_in_source = os.listdir(source_covers)
    
    for lid, titulo, current_filename in libros:
        target_found = None
        
        # Intentar coincidencia por título
        norm_titulo = normalize(titulo)
        for f in files_in_source:
            if norm_titulo in normalize(f):
                target_found = f
                break
        
        if target_found:
            ext = os.path.splitext(target_found)[1]
            # Si no tiene nombre de portada en DB o es el viejo, generamos uno nuevo o usamos el de la DB
            new_filename = current_filename if current_filename else f"{uuid.uuid4().hex}{ext}"
            
            src_path = os.path.join(source_covers, target_found)
            dst_path = os.path.join(dest_covers, new_filename)
            
            shutil.copy2(src_path, dst_path)
            
            if not current_filename:
                cur.execute("UPDATE libros SET portada_filename = ? WHERE id = ?", (new_filename, lid))
            
            print(f"[*] Vinculado: '{titulo}' -> {new_filename} (desde {target_found})")
        else:
            print(f"[!] No se encontró imagen para: '{titulo}'")

    conn.commit()
    conn.close()
    print("\n--- Sincronización Finalizada ---")

if __name__ == "__main__":
    run_sync()
