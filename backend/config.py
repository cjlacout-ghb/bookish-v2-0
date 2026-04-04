import os

# Directorio raíz del backend
BASE_DIR = os.path.dirname(__file__)

# Directorio donde se almacenan las portadas
COVERS_DIR = os.path.join(BASE_DIR, "covers")
os.makedirs(COVERS_DIR, exist_ok=True)

# Tamaño máximo permitido para imágenes de portada (5 MB)
MAX_COVER_SIZE_BYTES = 5 * 1024 * 1024  # Fix-11
