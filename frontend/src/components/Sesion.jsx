import { useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { API } from '../services/api.js'

/**
 * Parsea una fecha ISO del servidor asegurando que se trate como UTC.
 */
function parsearFechaUTC(str) {
  if (!str) return null
  // Si no tiene zona horaria (Z o offset), le agregamos Z
  const s = (/Z|[+-]\d{2}(:?\d{2})?$/.test(str)) ? str : str + 'Z'
  return new Date(s).getTime()
}

/**
 * Formatea una fecha ISO para mostrarla en la hora oficial de Buenos Aires (UTC-3).
 */
export function formatearRelojBA(isoString) {
  if (!isoString) return '—'
  // Forzamos que se interprete como UTC si no tiene zona
  const s = (/Z|[+-]\d{2}(:?\d{2})?$/.test(isoString)) ? isoString : isoString + 'Z'
  const date = new Date(s)
  return date.toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Argentina/Buenos_Aires',
    hour12: true
  }).replace(/\./g, '') // Limpiamos puntos si el navegador los pone (e.g. p. m.)
}

/**
 * Obtiene la fecha actual en formato YYYY-MM-DD según la zona horaria de Buenos Aires.
 */
export function getHoyBA() {
  const d = new Date()
  const formatter = new Intl.DateTimeFormat('en-CA', { // en-CA da YYYY-MM-DD
    timeZone: 'America/Argentina/Buenos_Aires',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
  return formatter.format(d)
}

/**
 * Formatea segundos como HH:MM:SS (para el cronómetro en tiempo real)
 */
export function formatearCronometro(segundos) {
  const s = Math.max(0, Math.floor(segundos))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  return [
    h.toString().padStart(2, '0'),
    m.toString().padStart(2, '0'),
    sec.toString().padStart(2, '0'),
  ].join(':')
}

/**
 * Formatea segundos en estilo legible: "2h 34m" | "47m" | "0m"
 */
export function formatearTiempo(segundos) {
  const s = Math.max(0, Math.floor(segundos))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

// ── Íconos (Art Déco / Noir) ────────────────────────────────────────────────
export const IconIniciar = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square">
    <path d="M5 3l14 9-14 9V3z" />
  </svg>
)

export const IconPausar = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square">
    <line x1="10" y1="4" x2="10" y2="20" />
    <line x1="14" y1="4" x2="14" y2="20" />
  </svg>
)

export const IconDetener = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square">
    <rect x="4" y="4" width="16" height="16" />
  </svg>
)

// ── Estado del timer ──────────────────────────────────────────────────────────
// idle → running → paused → (stop shows note input) → idle

/**
 * Timer de lectura con estado persistente.
 *
 * Props:
 *   libroId           — id del libro
 *   totalSegundos     — tiempo acumulado histórico desde la BD
 *   sesionActiva      — objeto sesión activa si la hay al cargar (from /api/sessions/active)
 *   onSesionGuardada  — callback(nuevosSegundosTotales) tras guardar sesión
 *   onSesionActiva    — callback(sesion|null) tras start/stop para sincronizar panel
 */
export default function Timer({
  libroId,
  totalSegundos = 0,
  sesionActiva = null,
  onSesionGuardada,
  onSesionActiva,
}) {
  // ── State ──────────────────────────────────────────────────────────────────
  const [estado, setEstado] = useState('idle') // 'idle' | 'running' | 'paused' | 'stopping'
  const [segundosActuales, setSegundosActuales] = useState(0)
  const [acumulado, setAcumulado] = useState(totalSegundos)
  const [nota, setNota] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  const intervalRef = useRef(null)
  // Epoch ms when the current running segment started (adjusted for pauses)
  const segmentoInicioRef = useRef(null)
  // Seconds accumulated across all running segments this "session view"
  const segundosAcumRef = useRef(0)

  // Sync acumulado si cambia desde fuera
  useEffect(() => {
    setAcumulado(totalSegundos)
  }, [totalSegundos])

  // ── Restore active session on mount ───────────────────────────────────────
  useEffect(() => {
    if (sesionActiva && sesionActiva.is_active) {
      const now = Date.now()
      const inicio = parsearFechaUTC(sesionActiva.iniciado_en)
      const offset = (sesionActiva.pause_offset_seconds || 0) * 1000

      if (sesionActiva.paused_at) {
        // Session is paused — compute elapsed up to pause moment
        const pausado = parsearFechaUTC(sesionActiva.paused_at)
        const elapsed = Math.floor((pausado - inicio - offset) / 1000)
        segundosAcumRef.current = Math.max(0, elapsed)
        setSegundosActuales(segundosAcumRef.current)
        setEstado('paused')
      } else {
        // Session is running — compute elapsed so far
        const elapsed = Math.floor((now - inicio - offset) / 1000)
        segundosAcumRef.current = Math.max(0, elapsed)
        setSegundosActuales(segundosAcumRef.current)
        setEstado('running')
        startInterval()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Cleanup interval on unmount
  useEffect(() => {
    return () => stopInterval()
  }, [])

  // ── Interval helpers ───────────────────────────────────────────────────────
  function startInterval() {
    stopInterval()
    segmentoInicioRef.current = Date.now()
    intervalRef.current = setInterval(() => {
      const segmentSecs = Math.floor((Date.now() - segmentoInicioRef.current) / 1000)
      setSegundosActuales(segundosAcumRef.current + segmentSecs)
    }, 1000)
  }

  function stopInterval() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    // Capture how many seconds elapsed in this segment
    if (segmentoInicioRef.current) {
      const segmentSecs = Math.floor((Date.now() - segmentoInicioRef.current) / 1000)
      segundosAcumRef.current += segmentSecs
      segmentoInicioRef.current = null
    }
  }

  // ── Actions ────────────────────────────────────────────────────────────────
  async function iniciar() {
    setError('')
    setGuardando(true)
    try {
      const sesion = await API.sesionStart(libroId)
      segundosAcumRef.current = 0
      setSegundosActuales(0)
      setEstado('running')
      startInterval()
      onSesionActiva?.(sesion)
    } catch (e) {
      setError(e.message || 'Error al iniciar la sesión')
    } finally {
      setGuardando(false)
    }
  }

  async function pausar() {
    stopInterval()
    setError('')
    setGuardando(true)
    try {
      const sesion = await API.sesionPause(libroId)
      setEstado('paused')
      onSesionActiva?.(sesion)
    } catch (e) {
      // Roll back interval
      setError(e.message || 'Error al pausar')
      setEstado('running')
      startInterval()
    } finally {
      setGuardando(false)
    }
  }

  async function reanudar() {
    setError('')
    setGuardando(true)
    try {
      const sesion = await API.sesionResume(libroId)
      setEstado('running')
      startInterval()
      onSesionActiva?.(sesion)
    } catch (e) {
      setError(e.message || 'Error al reanudar')
    } finally {
      setGuardando(false)
    }
  }

  function mostrarFormStop() {
    if (estado === 'running') stopInterval()
    setEstado('stopping')
    setNota('')
  }

  async function confirmarStop() {
    setError('')
    setGuardando(true)
    try {
      const sesion = await API.sesionStop(libroId, nota.trim() || null)
      const nuevoAcumulado = acumulado + (sesion.duracion_segundos || 0)
      setAcumulado(nuevoAcumulado)
      setSegundosActuales(0)
      segundosAcumRef.current = 0
      setNota('')
      setEstado('idle')
      onSesionGuardada?.(nuevoAcumulado)
      onSesionActiva?.(null)
    } catch (e) {
      setError(e.message || 'Error al detener la sesión')
    } finally {
      setGuardando(false)
    }
  }

  function cancelarStop() {
    // Go back to running if we were running before
    setEstado('running')
    startInterval()
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="sesion-layout-premium">
      <div className="sesion-hero">
        <span className="sesion-hero__label">Sesión de lectura actual</span>
        <div className={`sesion-hero__display ${estado === 'running' ? 'gold-glow' : ''}`}>
          {formatearCronometro(segundosActuales)}
        </div>
        <div className="sesion-hero__quote">
          Una vida de lecturas es una vida plena
        </div>
      </div>

      <div className="sesion-acciones-grid">
        {estado === 'idle' && (
          <button
            id={`sesion-btn-iniciar-${libroId}`}
            className="btn-premium btn-premium--start"
            onClick={iniciar}
            disabled={guardando}
          >
            {guardando ? 'Iniciando...' : <><IconIniciar /> INICIAR SESIÓN</>}
          </button>
        )}

        {estado === 'running' && (
          <>
            <button
              id={`sesion-btn-pausar-${libroId}`}
              className="btn-premium"
              onClick={pausar}
              disabled={guardando}
            >
              {guardando ? '...' : <><IconPausar /> PAUSAR</>}
            </button>
            <button
              id={`sesion-btn-stop-${libroId}`}
              className="btn-premium btn-premium--stop"
              onClick={mostrarFormStop}
              disabled={guardando}
            >
              <IconDetener /> DETENER
            </button>
          </>
        )}

        {estado === 'paused' && (
          <>
            <button
              id={`sesion-btn-reanudar-${libroId}`}
              className="btn-premium"
              onClick={reanudar}
              disabled={guardando}
            >
              {guardando ? '...' : <><IconIniciar /> REANUDAR</>}
            </button>
            <button
              id={`sesion-btn-stop-paused-${libroId}`}
              className="btn-premium btn-premium--stop"
              onClick={mostrarFormStop}
              disabled={guardando}
            >
              <IconDetener /> DETENER
            </button>
          </>
        )}

        {estado === 'stopping' && (
          <div className="sesion__stop-form" style={{ gridColumn: 'span 2' }}>
            <textarea
              className="campo__entrada campo__entrada--textarea"
              style={{ marginBottom: 'var(--espacio-sm)', fontSize: '0.9rem' }}
              placeholder="Nota opcional sobre la sesión…"
              value={nota}
              onChange={e => setNota(e.target.value)}
              rows={2}
            />
            <div style={{ display: 'flex', gap: 'var(--espacio-sm)' }}>
              <button
                id={`sesion-btn-confirmar-stop-${libroId}`}
                className="btn-peligro btn"
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={confirmarStop}
                disabled={guardando}
              >
                {guardando ? 'Guardando...' : 'GUARDAR Y FINALIZAR'}
              </button>
              <button
                className="btn btn-secundario"
                onClick={cancelarStop}
                disabled={guardando}
              >
                CANCELAR
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="sesion-divisor">
        <div className="sesion-divisor__diamond" />
      </div>

      {error && (
        <p className="sesion__error" style={{ textAlign: 'center', marginTop: '-0.5rem', color: 'var(--texto-error)' }}>✕ {error}</p>
      )}
    </div>
  )
}

Timer.propTypes = {
  libroId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  totalSegundos: PropTypes.number,
  sesionActiva: PropTypes.object,
  onSesionGuardada: PropTypes.func,
  onSesionActiva: PropTypes.func,
}
