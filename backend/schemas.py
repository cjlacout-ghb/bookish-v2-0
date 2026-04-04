from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date

class LibroCreate(BaseModel):
    titulo: str
    autor: str
    genero: Optional[str] = None
    paginas: Optional[int] = None
    pagina_actual: Optional[int] = 0
    editorial: Optional[str] = None
    anio: Optional[int] = None
    isbn: Optional[str] = None
    estado: Optional[str] = "por_leer"
    formato: Optional[str] = "analógico"
    calificacion: Optional[int] = 0
    fecha_inicio: Optional[date] = None
    fecha_fin: Optional[date] = None
    ultima_edicion_anio: Optional[int] = None
    ultima_edicion_detalle: Optional[str] = None
    etiquetas: Optional[str] = None
    resena: Optional[str] = None

class LibroUpdate(BaseModel):
    titulo: Optional[str] = None
    autor: Optional[str] = None
    genero: Optional[str] = None
    paginas: Optional[int] = None
    pagina_actual: Optional[int] = None
    editorial: Optional[str] = None
    anio: Optional[int] = None
    isbn: Optional[str] = None
    estado: Optional[str] = None
    formato: Optional[str] = None
    calificacion: Optional[int] = None
    fecha_inicio: Optional[date] = None
    fecha_fin: Optional[date] = None
    ultima_edicion_anio: Optional[int] = None
    ultima_edicion_detalle: Optional[str] = None
    etiquetas: Optional[str] = None
    resena: Optional[str] = None

class LibroOut(BaseModel):
    id: int
    titulo: str
    autor: str
    genero: Optional[str]
    paginas: Optional[int]
    pagina_actual: Optional[int]
    editorial: Optional[str]
    anio: Optional[int]
    isbn: Optional[str]
    estado: str
    formato: Optional[str]
    calificacion: int
    fecha_inicio: Optional[date]
    fecha_fin: Optional[date]
    ultima_edicion_anio: Optional[int]
    ultima_edicion_detalle: Optional[str]
    portada_filename: Optional[str]
    etiquetas: Optional[str]
    resena: Optional[str]
    creado_en: datetime
    total_segundos: Optional[int] = 0

    class Config:
        from_attributes = True

class NotaCreate(BaseModel):
    contenido: str
    numero_pagina: Optional[int] = None
    es_cita: Optional[bool] = False

class NotaOut(BaseModel):
    id: int
    libro_id: int
    contenido: str
    numero_pagina: Optional[int]
    es_cita: bool
    creado_en: datetime

    class Config:
        from_attributes = True

class SesionCreate(BaseModel):
    iniciado_en: datetime
    finalizado_en: datetime
    duracion_segundos: int

# Stage 1.5 schemas
class LibroResumen(BaseModel):
    id: int
    titulo: str
    autor: str
    portada_filename: Optional[str] = None

    class Config:
        from_attributes = True

class SesionOut(BaseModel):
    id: int
    libro_id: int
    iniciado_en: datetime
    finalizado_en: Optional[datetime]
    duracion_segundos: int
    is_active: bool = False
    paused_at: Optional[datetime] = None
    pause_offset_seconds: int = 0
    session_note: Optional[str] = None

    class Config:
        from_attributes = True

class SesionActivaOut(BaseModel):
    """Session with embedded book info — used by /api/sessions/active"""
    id: int
    libro_id: int
    iniciado_en: datetime
    finalizado_en: Optional[datetime]
    duracion_segundos: int
    is_active: bool = False
    paused_at: Optional[datetime] = None
    pause_offset_seconds: int = 0
    session_note: Optional[str] = None
    libro: LibroResumen

    class Config:
        from_attributes = True

class SesionUpdate(BaseModel):
    iniciado_en: Optional[datetime] = None
    finalizado_en: Optional[datetime] = None
    duracion_segundos: Optional[int] = None
    session_note: Optional[str] = None

class StopTimerBody(BaseModel):
    session_note: Optional[str] = None

class StatsOut(BaseModel):
    total_libros: int
    libros_leidos: int
    libros_leyendo: int
    libros_por_leer: int
    total_paginas: int
    total_segundos: int

# ── Report schemas ────────────────────────────────────────────────────────────

class SesionReporteOut(BaseModel):
    id: int
    libro_id: int
    libro_titulo: str
    libro_portada: Optional[str]
    iniciado_en: datetime
    finalizado_en: Optional[datetime]
    duracion_segundos: int
    session_note: Optional[str]

class ReporteDia(BaseModel):
    fecha: str
    total_segundos: int
    libros_count: int
    sesiones: List[SesionReporteOut]

class FilaDiaMes(BaseModel):
    dia: int
    fecha: str
    total_segundos: int

class ReporteMes(BaseModel):
    anio: int
    mes: int
    total_segundos: int
    promedio_segundos_dia: int
    dias: List[FilaDiaMes]

class FilaMesAnio(BaseModel):
    mes: int
    nombre_mes: str
    total_segundos: int

class ReporteAnio(BaseModel):
    anio: int
    total_segundos: int
    libro_mas_leido: Optional[str]
    meses: List[FilaMesAnio]
