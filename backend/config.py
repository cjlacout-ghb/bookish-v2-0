import os
import sys

def get_data_dir():
    home = os.path.expanduser("~")
    # Usar la carpeta de Documentos para que sea fácil de encontrar para el usuario
    if sys.platform == "win32":
        try:
            # Intentar obtener la ruta real de Documentos mediante la API de Windows
            # Esto resuelve problemas con nombres localizados (Documentos vs Documents)
            import ctypes
            from ctypes import wintypes
            buf = ctypes.create_unicode_buffer(wintypes.MAX_PATH)
            # 5 = CSIDL_PERSONAL (Mis Documentos)
            ctypes.windll.shell32.SHGetFolderPathW(None, 5, None, 0, buf)
            documents = buf.value
        except Exception:
            # Fallback por si falla la llamada a la API
            documents = os.path.join(home, "Documents")
        return os.path.join(documents, "Bookish", "data")
    elif sys.platform == "darwin":
        return os.path.join(home, "Documents", "Bookish", "data")
    else:
        # En Linux, ~/Documents
        documents = os.path.join(home, "Documents")
        if os.path.exists(documents):
            return os.path.join(documents, "Bookish", "data")
        return os.path.join(home, ".bookish", "data")

DATA_DIR = get_data_dir()
os.makedirs(DATA_DIR, exist_ok=True)

# Directorio raíz del script original
BASE_DIR = os.path.dirname(__file__)

# Directorio donde se almacenan las portadas (ahora en AppData)
COVERS_DIR = os.path.join(DATA_DIR, "portadas")
os.makedirs(COVERS_DIR, exist_ok=True)

# Directorio donde se almacenan las capturas de sesiones de lectura
CAPTURAS_DIR = os.path.join(DATA_DIR, "capturas")
os.makedirs(CAPTURAS_DIR, exist_ok=True)

# Tamaño máximo permitido para imágenes de portada (5 MB)
MAX_COVER_SIZE_BYTES = 5 * 1024 * 1024  # Fix-11
