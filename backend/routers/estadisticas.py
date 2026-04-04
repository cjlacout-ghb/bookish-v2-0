from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
from models import Libro, SesionLectura
from schemas import StatsOut

router = APIRouter()

@router.get("/estadisticas", response_model=StatsOut)
def obtener_estadisticas(db: Session = Depends(get_db)):
    total_libros = db.query(func.count(Libro.id)).scalar() or 0
    libros_leidos = db.query(func.count(Libro.id)).filter(Libro.estado == "leido").scalar() or 0
    libros_leyendo = db.query(func.count(Libro.id)).filter(Libro.estado == "leyendo").scalar() or 0
    libros_por_leer = db.query(func.count(Libro.id)).filter(Libro.estado == "por_leer").scalar() or 0
    
    # Suma de páginas progresiva: terminados + progreso de libros activos
    terminados_paginas = db.query(func.sum(Libro.paginas)).filter(Libro.estado == "leido").scalar() or 0
    leyendo_paginas    = db.query(func.sum(Libro.pagina_actual)).filter(Libro.estado == "leyendo").scalar() or 0
    total_paginas      = terminados_paginas + leyendo_paginas
    
    total_segundos = db.query(func.sum(SesionLectura.duracion_segundos)).scalar() or 0

    return StatsOut(
        total_libros=total_libros,
        libros_leidos=libros_leidos,
        libros_leyendo=libros_leyendo,
        libros_por_leer=libros_por_leer,
        total_paginas=total_paginas,
        total_segundos=total_segundos,
    )
