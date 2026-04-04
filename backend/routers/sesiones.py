"""
sesiones.py — Timer control, session management, and reading reports.
Stage 1.5 — replaces the original minimal router.
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, date, timedelta
import calendar

from database import get_db
from models import Libro, SesionLectura
from schemas import (
    SesionCreate, SesionOut, SesionActivaOut, SesionUpdate,
    StopTimerBody, ReporteDia, ReporteMes, ReporteAnio,
    SesionReporteOut, FilaDiaMes, FilaMesAnio,
)

router = APIRouter()

NOMBRES_MESES = [
    "", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
]

# ── Helpers ───────────────────────────────────────────────────────────────────

def _get_libro_or_404(libro_id: int, db: Session) -> Libro:
    libro = db.query(Libro).filter(Libro.id == libro_id).first()
    if not libro:
        raise HTTPException(status_code=404, detail="Libro no encontrado")
    return libro


def _get_sesion_or_404(sesion_id: int, db: Session) -> SesionLectura:
    s = db.query(SesionLectura).filter(SesionLectura.id == sesion_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Sesión no encontrada")
    return s


def _active_session(libro_id: int, db: Session) -> Optional[SesionLectura]:
    return db.query(SesionLectura).filter(
        SesionLectura.libro_id == libro_id,
        SesionLectura.is_active == True,
    ).first()

# ── Legacy: list / create sessions (Stage 1 compat) ──────────────────────────

@router.get("/libros/{libro_id}/sesiones", response_model=List[SesionOut])
def listar_sesiones(libro_id: int, db: Session = Depends(get_db)):
    return db.query(SesionLectura).filter(
        SesionLectura.libro_id == libro_id
    ).order_by(SesionLectura.iniciado_en.desc()).all()


@router.post("/libros/{libro_id}/sesiones", response_model=SesionOut, status_code=201)
def guardar_sesion(libro_id: int, sesion: SesionCreate, db: Session = Depends(get_db)):
    libro = _get_libro_or_404(libro_id, db)
    db_sesion = SesionLectura(libro_id=libro_id, **sesion.model_dump())
    db.add(db_sesion)
    db.commit()
    db.refresh(db_sesion)
    return db_sesion

# ── Timer control ─────────────────────────────────────────────────────────────

@router.post("/libros/{libro_id}/timer/start", response_model=SesionOut)
def timer_start(libro_id: int, db: Session = Depends(get_db)):
    _get_libro_or_404(libro_id, db)
    existing = _active_session(libro_id, db)
    if existing:
        raise HTTPException(status_code=400, detail="Ya existe una sesión activa para este libro")
    sesion = SesionLectura(
        libro_id=libro_id,
        iniciado_en=datetime.utcnow(),
        is_active=True,
        pause_offset_seconds=0,
    )
    db.add(sesion)
    db.commit()
    db.refresh(sesion)
    return sesion


@router.post("/libros/{libro_id}/timer/pause", response_model=SesionOut)
def timer_pause(libro_id: int, db: Session = Depends(get_db)):
    _get_libro_or_404(libro_id, db)
    sesion = _active_session(libro_id, db)
    if not sesion:
        raise HTTPException(status_code=404, detail="No hay sesión activa para este libro")
    if sesion.paused_at:
        raise HTTPException(status_code=400, detail="La sesión ya está pausada")
    sesion.paused_at = datetime.utcnow()
    db.commit()
    db.refresh(sesion)
    return sesion


@router.post("/libros/{libro_id}/timer/resume", response_model=SesionOut)
def timer_resume(libro_id: int, db: Session = Depends(get_db)):
    _get_libro_or_404(libro_id, db)
    sesion = _active_session(libro_id, db)
    if not sesion:
        raise HTTPException(status_code=404, detail="No hay sesión activa para este libro")
    if not sesion.paused_at:
        raise HTTPException(status_code=400, detail="La sesión no está pausada")
    # Accumulate the pause time
    paused_duration = int((datetime.utcnow() - sesion.paused_at).total_seconds())
    sesion.pause_offset_seconds = (sesion.pause_offset_seconds or 0) + paused_duration
    sesion.paused_at = None
    db.commit()
    db.refresh(sesion)
    return sesion


@router.post("/libros/{libro_id}/timer/stop", response_model=SesionOut)
def timer_stop(libro_id: int, body: StopTimerBody = StopTimerBody(), db: Session = Depends(get_db)):
    _get_libro_or_404(libro_id, db)
    sesion = _active_session(libro_id, db)
    if not sesion:
        raise HTTPException(status_code=404, detail="No hay sesión activa para este libro")

    now = datetime.utcnow()

    # If still paused, add remaining pause to offset before stopping
    if sesion.paused_at:
        paused_duration = int((now - sesion.paused_at).total_seconds())
        sesion.pause_offset_seconds = (sesion.pause_offset_seconds or 0) + paused_duration
        sesion.paused_at = None

    total_elapsed = int((now - sesion.iniciado_en).total_seconds())
    net_seconds = max(0, total_elapsed - (sesion.pause_offset_seconds or 0))

    sesion.finalizado_en = now
    sesion.duracion_segundos = net_seconds
    sesion.is_active = False
    sesion.session_note = body.session_note

    db.commit()
    db.refresh(sesion)
    return sesion

# ── Active sessions (central panel) ──────────────────────────────────────────

@router.get("/sessions/active", response_model=List[SesionActivaOut])
def sesiones_activas(db: Session = Depends(get_db)):
    sesiones = db.query(SesionLectura).filter(
        SesionLectura.is_active == True
    ).all()
    return sesiones

# ── Session CRUD (edit / delete) ──────────────────────────────────────────────

@router.put("/sessions/{sesion_id}", response_model=SesionOut)
def editar_sesion(sesion_id: int, datos: SesionUpdate, db: Session = Depends(get_db)):
    sesion = _get_sesion_or_404(sesion_id, db)
    if datos.iniciado_en is not None:
        sesion.iniciado_en = datos.iniciado_en
    if datos.finalizado_en is not None:
        sesion.finalizado_en = datos.finalizado_en
    if datos.session_note is not None:
        sesion.session_note = datos.session_note
    # Recompute duration if both timestamps present
    if sesion.finalizado_en and sesion.iniciado_en:
        computed = int((sesion.finalizado_en - sesion.iniciado_en).total_seconds())
        sesion.duracion_segundos = max(0, computed - (sesion.pause_offset_seconds or 0))
    elif datos.duracion_segundos is not None:
        sesion.duracion_segundos = datos.duracion_segundos
    db.commit()
    db.refresh(sesion)
    return sesion


@router.delete("/sessions/{sesion_id}", status_code=204)
def eliminar_sesion(sesion_id: int, db: Session = Depends(get_db)):
    sesion = _get_sesion_or_404(sesion_id, db)
    db.delete(sesion)
    db.commit()

# ── Reports ───────────────────────────────────────────────────────────────────

def _sesion_to_reporte(s: SesionLectura) -> SesionReporteOut:
    return SesionReporteOut(
        id=s.id,
        libro_id=s.libro_id,
        libro_titulo=s.libro.titulo if s.libro else "—",
        libro_portada=s.libro.portada_filename if s.libro else None,
        iniciado_en=s.iniciado_en,
        finalizado_en=s.finalizado_en,
        duracion_segundos=s.duracion_segundos or 0,
        session_note=s.session_note,
    )


@router.get("/reports/day", response_model=ReporteDia)
def reporte_dia(date_str: str = Query(None, alias="date"), db: Session = Depends(get_db)):
    if date_str:
        try:
            target = datetime.strptime(date_str, "%Y-%m-%d").date()
        except ValueError:
            raise HTTPException(status_code=400, detail="Formato de fecha inválido. Use YYYY-MM-DD")
    else:
        target = date.today()

    day_start = datetime(target.year, target.month, target.day, 0, 0, 0)
    day_end = datetime(target.year, target.month, target.day, 23, 59, 59)

    sesiones = (
        db.query(SesionLectura)
        .filter(
            SesionLectura.is_active == False,
            SesionLectura.iniciado_en >= day_start,
            SesionLectura.iniciado_en <= day_end,
        )
        .order_by(SesionLectura.iniciado_en)
        .all()
    )

    total_segundos = sum(s.duracion_segundos or 0 for s in sesiones)
    libros_ids = set(s.libro_id for s in sesiones)

    return ReporteDia(
        fecha=target.isoformat(),
        total_segundos=total_segundos,
        libros_count=len(libros_ids),
        sesiones=[_sesion_to_reporte(s) for s in sesiones],
    )


@router.get("/reports/month", response_model=ReporteMes)
def reporte_mes(
    year: int = Query(...),
    month: int = Query(...),
    db: Session = Depends(get_db),
):
    if not (1 <= month <= 12):
        raise HTTPException(status_code=400, detail="Mes inválido")

    _, days_in_month = calendar.monthrange(year, month)
    month_start = datetime(year, month, 1)
    month_end = datetime(year, month, days_in_month, 23, 59, 59)

    sesiones = (
        db.query(SesionLectura)
        .filter(
            SesionLectura.is_active == False,
            SesionLectura.iniciado_en >= month_start,
            SesionLectura.iniciado_en <= month_end,
        )
        .all()
    )

    # Aggregate by day
    por_dia: dict[int, int] = {}
    for s in sesiones:
        d = s.iniciado_en.day
        por_dia[d] = por_dia.get(d, 0) + (s.duracion_segundos or 0)

    total_segundos = sum(por_dia.values())
    dias_con_lectura = len(por_dia)
    promedio = (total_segundos // dias_con_lectura) if dias_con_lectura else 0

    filas = [
        FilaDiaMes(
            dia=d,
            fecha=f"{year:04d}-{month:02d}-{d:02d}",
            total_segundos=por_dia.get(d, 0),
        )
        for d in range(1, days_in_month + 1)
    ]

    return ReporteMes(
        anio=year,
        mes=month,
        total_segundos=total_segundos,
        promedio_segundos_dia=promedio,
        dias=filas,
    )


@router.get("/reports/year", response_model=ReporteAnio)
def reporte_anio(year: int = Query(...), db: Session = Depends(get_db)):
    year_start = datetime(year, 1, 1)
    year_end = datetime(year, 12, 31, 23, 59, 59)

    sesiones = (
        db.query(SesionLectura)
        .filter(
            SesionLectura.is_active == False,
            SesionLectura.iniciado_en >= year_start,
            SesionLectura.iniciado_en <= year_end,
        )
        .all()
    )

    por_mes: dict[int, int] = {}
    por_libro: dict[int, int] = {}
    for s in sesiones:
        m = s.iniciado_en.month
        por_mes[m] = por_mes.get(m, 0) + (s.duracion_segundos or 0)
        por_libro[s.libro_id] = por_libro.get(s.libro_id, 0) + (s.duracion_segundos or 0)

    total_segundos = sum(por_mes.values())

    # Most-read book
    libro_mas_leido = None
    if por_libro:
        top_id = max(por_libro, key=lambda k: por_libro[k])
        libro_obj = db.query(Libro).filter(Libro.id == top_id).first()
        if libro_obj:
            libro_mas_leido = libro_obj.titulo

    meses = [
        FilaMesAnio(
            mes=m,
            nombre_mes=NOMBRES_MESES[m],
            total_segundos=por_mes.get(m, 0),
        )
        for m in range(1, 13)
    ]

    return ReporteAnio(
        anio=year,
        total_segundos=total_segundos,
        libro_mas_leido=libro_mas_leido,
        meses=meses,
    )
