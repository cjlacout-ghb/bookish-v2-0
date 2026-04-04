from fastapi import APIRouter, Depends, HTTPException
from typing import List
from sqlalchemy.orm import Session
from database import get_db
from models import Libro, Nota
from schemas import NotaCreate, NotaOut

router = APIRouter()

@router.get("/libros/{libro_id}/notas", response_model=List[NotaOut])
def listar_notas(libro_id: int, db: Session = Depends(get_db)):
    libro = db.query(Libro).filter(Libro.id == libro_id).first()
    if not libro:
        raise HTTPException(status_code=404, detail="Libro no encontrado")
    return db.query(Nota).filter(Nota.libro_id == libro_id).order_by(Nota.creado_en.desc()).all()

@router.post("/libros/{libro_id}/notas", response_model=NotaOut, status_code=201)
def crear_nota(libro_id: int, nota: NotaCreate, db: Session = Depends(get_db)):
    libro = db.query(Libro).filter(Libro.id == libro_id).first()
    if not libro:
        raise HTTPException(status_code=404, detail="Libro no encontrado")
    db_nota = Nota(libro_id=libro_id, **nota.model_dump())
    db.add(db_nota)
    db.commit()
    db.refresh(db_nota)
    return db_nota

@router.delete("/notas/{nota_id}", status_code=204)
def eliminar_nota(nota_id: int, db: Session = Depends(get_db)):
    nota = db.query(Nota).filter(Nota.id == nota_id).first()
    if not nota:
        raise HTTPException(status_code=404, detail="Nota no encontrada")
    db.delete(nota)
    db.commit()
