"""
Migración: renombrar columnas en la tabla 'libros'
  anio                → primera_edicion_anio
  ultima_edicion_detalle → actual_edicion_anio

Requiere SQLite 3.25+ (disponible en Python 3.6+ en adelante).
Ejecutar una sola vez antes de arrancar el backend con el código actualizado.
"""

import sqlite3
import os
import sys

# ── Ruta a la DB ─────────────────────────────────────────────────────────────
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(SCRIPT_DIR, '..', 'bookish.db')
DB_PATH = os.path.normpath(DB_PATH)

if not os.path.exists(DB_PATH):
    print(f"ERROR: No se encontró la base de datos en: {DB_PATH}")
    sys.exit(1)

conn = sqlite3.connect(DB_PATH)
cur = conn.cursor()

# ── Verificar versión de SQLite ───────────────────────────────────────────────
version = sqlite3.sqlite_version_info
print(f"SQLite versión: {sqlite3.sqlite_version}")
if version < (3, 25, 0):
    print("ERROR: se requiere SQLite 3.25+ para RENAME COLUMN")
    conn.close()
    sys.exit(1)

# ── Leer columnas actuales ────────────────────────────────────────────────────
cur.execute("PRAGMA table_info(libros)")
columnas = [row[1] for row in cur.fetchall()]
print(f"Columnas actuales: {columnas}")

# ── Renombrar anio → primera_edicion_anio ────────────────────────────────────
if 'anio' in columnas and 'primera_edicion_anio' not in columnas:
    cur.execute("ALTER TABLE libros RENAME COLUMN anio TO primera_edicion_anio")
    print("✓ Renombrado: anio → primera_edicion_anio")
elif 'primera_edicion_anio' in columnas:
    print("— Ya existe 'primera_edicion_anio', se omite.")
else:
    print("⚠ No se encontró 'anio', verificar manualmente.")

# ── Renombrar ultima_edicion_detalle → actual_edicion_anio ───────────────────
if 'ultima_edicion_detalle' in columnas and 'actual_edicion_anio' not in columnas:
    cur.execute("ALTER TABLE libros RENAME COLUMN ultima_edicion_detalle TO actual_edicion_anio")
    print("✓ Renombrado: ultima_edicion_detalle → actual_edicion_anio")
elif 'actual_edicion_anio' in columnas:
    print("— Ya existe 'actual_edicion_anio', se omite.")
else:
    print("⚠ No se encontró 'ultima_edicion_detalle', verificar manualmente.")

conn.commit()

# ── Verificación final ────────────────────────────────────────────────────────
cur.execute("PRAGMA table_info(libros)")
columnas_post = [row[1] for row in cur.fetchall()]
print(f"\nColumnas finales: {columnas_post}")

conn.close()
print("\n✓ Migración completada.")
