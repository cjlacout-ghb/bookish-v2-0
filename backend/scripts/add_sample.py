import sys
import os
import shutil
import uuid

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal
from models import Libro

def main():
    db = SessionLocal()
    # Create book
    libro = Libro(
        titulo="El Gran Gatsby",
        autor="F. Scott Fitzgerald",
        genero="Ficción Clásica",
        paginas=218,
        estado="leyendo",
        calificacion=5,
        resena="Una obra maestra de la era del jazz. Increíble cómo describe el anhelo y la decadencia.",
        etiquetas="clásico, jazz, años 20"
    )
    db.add(libro)
    db.commit()
    db.refresh(libro)

    # Move image to covers with UUID
    src_img = r"C:\Users\LACOUT\.gemini\antigravity\brain\81d18bf3-6a00-4c0c-acc6-2c0638e9b744\art_deco_book_cover_1775133057605.png"
    covers_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "covers")
    os.makedirs(covers_dir, exist_ok=True)
    
    if os.path.exists(src_img):
        filename = f"{uuid.uuid4().hex}.png"
        dst_img = os.path.join(covers_dir, filename)
        shutil.copy(src_img, dst_img)
        libro.portada_filename = filename
        db.commit()
        print("Portada copiada exitosamente.")

    print("Libro de ejemplo añadido exitosamente.")
    db.close()

if __name__ == "__main__":
    main()
