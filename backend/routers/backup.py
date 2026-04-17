import os
import shutil
import zipfile
from tempfile import NamedTemporaryFile
from fastapi import APIRouter, File, UploadFile, HTTPException
from fastapi.responses import FileResponse
from config import DATA_DIR, COVERS_DIR, CAPTURAS_DIR
from database import engine

router = APIRouter()

@router.get("/export")
async def export_database():
    """Generates a zip file containing the database and media folders."""
    # We create a temporary file that will hold the zip archive
    temp_file = NamedTemporaryFile(delete=False, suffix=".zip")
    temp_zip_path = temp_file.name
    temp_file.close()

    try:
        with zipfile.ZipFile(temp_zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
            db_path = os.path.join(DATA_DIR, 'bookish.db')
            if os.path.exists(db_path):
                # We can't really guarantee it's not locked if we're using it, but it's sqlite, it's usually fine for read
                zipf.write(db_path, 'bookish.db')

            if os.path.exists(COVERS_DIR):
                for root, _, files in os.walk(COVERS_DIR):
                    for file in files:
                        abs_path = os.path.join(root, file)
                        rel_path = os.path.relpath(abs_path, DATA_DIR)
                        zipf.write(abs_path, rel_path)

            if os.path.exists(CAPTURAS_DIR):
                for root, _, files in os.walk(CAPTURAS_DIR):
                    for file in files:
                        abs_path = os.path.join(root, file)
                        rel_path = os.path.relpath(abs_path, DATA_DIR)
                        zipf.write(abs_path, rel_path)

        return FileResponse(temp_zip_path, filename="bookish_backup.zip", media_type="application/zip")
    except Exception as e:
        if os.path.exists(temp_zip_path):
            os.unlink(temp_zip_path)
        raise HTTPException(status_code=500, detail=f"Error al generar backup: {str(e)}")

@router.post("/import")
async def import_database(file: UploadFile = File(...)):
    """Receives a zip file and overwrites the database and media folders."""
    if not file.filename.endswith('.zip'):
        raise HTTPException(status_code=400, detail="El archivo de backup debe ser un .zip")

    # Create a temporary file to save the uploaded zip
    temp_file = NamedTemporaryFile(delete=False, suffix=".zip")
    try:
        content = await file.read()
        temp_file.write(content)
        temp_file.close()

        # Engine disposal to release connection to the db file (on windows it might be locked)
        engine.dispose()

        # Verify it's a valid zip
        if not zipfile.is_zipfile(temp_file.name):
            raise HTTPException(status_code=400, detail="El archivo no es un ZIP válido")

        with zipfile.ZipFile(temp_file.name, 'r') as zipf:
            # Optionally validate contents here, but for now we extract to DATA_DIR
            zipf.extractall(DATA_DIR)

        return {"mensaje": "Backup importado y sobrescrito exitosamente. Por favor, reinicia la aplicación."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al importar backup: {str(e)}")
    finally:
        if os.path.exists(temp_file.name):
            os.unlink(temp_file.name)
