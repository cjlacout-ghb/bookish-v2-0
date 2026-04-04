import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header.jsx'
import { formatearCronometro, formatearTiempo } from '../components/Timer.jsx'
import { API } from '../services/api.js'

/* ── Live counter for a single active session card ──────────────────────── */
function ContadorVivo({ sesion }) {
  const [secs, setSecs] = useState(0)
  const intervalRef = useRef(null)

  useEffect(() => {
    function calcular() {
      const now = Date.now()
      const inicio = new Date(sesion.iniciado_en).getTime()
      const offset = (sesion.pause_offset_seconds || 0) * 1000
      if (sesion.paused_at) {
        const pausado = new Date(sesion.paused_at).getTime()
        setSecs(Math.max(0, Math.floor((pausado - inicio - offset) / 1000)))
      } else {
        setSecs(Math.max(0, Math.floor((now - inicio - offset) / 1000)))
      }
    }
    calcular()
    if (!sesion.paused_at) {
      intervalRef.current = setInterval(calcular, 1000)
    }
    return () => clearInterval(intervalRef.current)
  }, [sesion])

  return (
    <span className={`timers-card__contador${sesion.paused_at ? ' timers-card__contador--pausa' : ''}`}>
      {formatearCronometro(secs)}
    </span>
  )
}

/* ── Modal to edit a completed session ──────────────────────────────────── */
function ModalEditarSesion({ sesion, onCerrar, onGuardada }) {
  const [iniciado, setIniciado] = useState(
    sesion.iniciado_en ? sesion.iniciado_en.slice(0, 16) : ''
  )
  const [finalizado, setFinalizado] = useState(
    sesion.finalizado_en ? sesion.finalizado_en.slice(0, 16) : ''
  )
  const [nota, setNota] = useState(sesion.session_note || '')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  async function guardar() {
    setError('')
    setGuardando(true)
    try {
      const data = {}
      if (iniciado) data.iniciado_en = new Date(iniciado).toISOString()
      if (finalizado) data.finalizado_en = new Date(finalizado).toISOString()
      data.session_note = nota.trim() || null
      const updated = await API.editarSesion(sesion.id, data)
      onGuardada(updated)
    } catch (e) {
      setError(e.message || 'Error al guardar')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onCerrar}>
      <div className="modal-caja" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-titulo">◆ Editar Sesión</h2>
          <button className="modal-cerrar" onClick={onCerrar}>✕</button>
        </div>
        <div className="modal-cuerpo" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="campo">
            <label className="campo__etiqueta">Inicio</label>
            <input
              type="datetime-local"
              className="campo__entrada"
              style={{ border: '1px solid var(--oro-oscuro)', padding: '0.5rem', background: 'var(--sup-alta)' }}
              value={iniciado}
              onChange={e => setIniciado(e.target.value)}
            />
          </div>
          <div className="campo">
            <label className="campo__etiqueta">Fin</label>
            <input
              type="datetime-local"
              className="campo__entrada"
              style={{ border: '1px solid var(--oro-oscuro)', padding: '0.5rem', background: 'var(--sup-alta)' }}
              value={finalizado}
              onChange={e => setFinalizado(e.target.value)}
            />
          </div>
          <div className="campo">
            <label className="campo__etiqueta">Nota</label>
            <textarea
              className="campo__entrada campo__entrada--textarea"
              rows={3}
              value={nota}
              onChange={e => setNota(e.target.value)}
              placeholder="Nota opcional…"
            />
          </div>
          {error && <p style={{ color: 'var(--texto-error)', fontSize: '0.85rem' }}>✕ {error}</p>}
        </div>
        <div className="modal-pie" style={{ display: 'flex', gap: '0.8rem', justifyContent: 'flex-end' }}>
          <button className="btn btn-secundario" onClick={onCerrar}>Cancelar</button>
          <button className="btn btn-primario" onClick={guardar} disabled={guardando}>
            {guardando ? '...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Main page ───────────────────────────────────────────────────────────── */
export default function Timers() {
  const navigate = useNavigate()
  const [activas, setActivas] = useState([])
  const [hoy, setHoy] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [sesionEditando, setSesionEditando] = useState(null)
  const [confirmBorrar, setConfirmBorrar] = useState(null)

  useEffect(() => {
    cargarDatos()
  }, [])

  async function cargarDatos() {
    setCargando(true)
    try {
      const today = new Date().toISOString().slice(0, 10)
      const [dataActivas, dataHoy] = await Promise.all([
        API.getSesionesActivas(),
        API.getReporteDia(today),
      ])
      setActivas(dataActivas)
      setHoy(dataHoy)
    } catch (e) {
      console.error('Error cargando timers:', e)
    } finally {
      setCargando(false)
    }
  }

  async function accionTimer(libroId, accion) {
    try {
      if (accion === 'pause') await API.timerPause(libroId)
      else if (accion === 'resume') await API.timerResume(libroId)
      else if (accion === 'stop') await API.timerStop(libroId, null)
      await cargarDatos()
    } catch (e) {
      console.error(e)
    }
  }

  async function borrarSesion(id) {
    try {
      await API.eliminarSesion(id)
      await cargarDatos()
      setConfirmBorrar(null)
    } catch (e) {
      console.error(e)
    }
  }

  function onSesionEditada(updated) {
    setSesionEditando(null)
    cargarDatos()
  }

  const sesionesHoyCompletadas = hoy?.sesiones || []
  const totalHoy = hoy?.total_segundos || 0

  return (
    <>
      <Header />
      <main className="pagina">
        <div className="timers-page animar-entrada">

          {/* Page title */}
          <div className="timers-page__header">
            <h1 className="timers-page__titulo">Sesiones</h1>
            <p className="timers-page__subtitulo">Panel de lectura activa</p>
          </div>

          {/* ── Leyendo ahora ──────────────────────────────────────────── */}
          <section className="seccion-bloque">
            <h2 className="seccion-titulo">◷ Leyendo ahora</h2>

            {cargando ? (
              <div className="cargando">◆ Cargando ◆</div>
            ) : activas.length === 0 ? (
              <div className="timers-vacio">
                <div className="timers-vacio__ornamento">
                  <span>◇</span><span className="timers-vacio__grande">◆</span><span>◇</span>
                </div>
                <p className="timers-vacio__texto">Ningún libro abierto</p>
                <p className="timers-vacio__hint">Inicia un cronómetro desde el detalle de cualquier libro en lectura.</p>
              </div>
            ) : (
              <div className="timers-cards">
                {activas.map(sesion => (
                  <div key={sesion.id} className={`timers-card${sesion.paused_at ? ' timers-card--pausada' : ''}`}>
                    {/* Portada pequeña */}
                    <div className="timers-card__portada">
                      {sesion.libro?.portada_filename ? (
                        <img src={`/portadas/${sesion.libro.portada_filename}`} alt="" />
                      ) : (
                        <span>◆</span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="timers-card__info">
                      <p
                        className="timers-card__titulo"
                        onClick={() => navigate(`/libro/${sesion.libro_id}`)}
                        style={{ cursor: 'pointer' }}
                      >
                        {sesion.libro?.titulo || '—'}
                      </p>
                      <p className="timers-card__autor">{sesion.libro?.autor || ''}</p>
                      <ContadorVivo sesion={sesion} />
                      {sesion.paused_at && (
                        <span className="timers-card__badge-pausa">⏸ En pausa</span>
                      )}
                    </div>

                    {/* Controles */}
                    <div className="timers-card__controles">
                      {sesion.paused_at ? (
                        <button
                          className="btn btn-sm btn-primario"
                          onClick={() => accionTimer(sesion.libro_id, 'resume')}
                        >
                          ▶ Reanudar
                        </button>
                      ) : (
                        <button
                          className="btn btn-sm btn-secundario"
                          onClick={() => accionTimer(sesion.libro_id, 'pause')}
                        >
                          ⏸ Pausar
                        </button>
                      )}
                      <button
                        className="btn btn-sm btn-peligro"
                        onClick={() => accionTimer(sesion.libro_id, 'stop')}
                      >
                        ◼ Detener
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ── Hoy ───────────────────────────────────────────────────── */}
          <section className="seccion-bloque">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 className="seccion-titulo" style={{ marginBottom: 0 }}>◈ Hoy</h2>
              {totalHoy > 0 && (
                <span className="timers-hoy__total">
                  Total: <strong>{formatearTiempo(totalHoy)}</strong>
                </span>
              )}
            </div>

            {cargando ? null : sesionesHoyCompletadas.length === 0 ? (
              <div className="estado-vacio" style={{ padding: 'var(--espacio-lg)' }}>
                <span className="estado-vacio__ornamento">◇</span>
                Sin sesiones completadas hoy.
              </div>
            ) : (
              <div className="timers-hoy__lista">
                {sesionesHoyCompletadas.map(sesion => {
                  const inicio = sesion.iniciado_en
                    ? new Date(sesion.iniciado_en).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
                    : '—'
                  const fin = sesion.finalizado_en
                    ? new Date(sesion.finalizado_en).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
                    : '—'
                  return (
                    <div key={sesion.id} className="timers-hoy__fila">
                      <div className="timers-hoy__libro">
                        <span className="timers-hoy__titulo">{sesion.libro_titulo}</span>
                        <span className="timers-hoy__rango">{inicio} – {fin}</span>
                        {sesion.session_note && (
                          <span className="timers-hoy__nota">"{sesion.session_note}"</span>
                        )}
                      </div>
                      <div className="timers-hoy__derecha">
                        <span className="timers-hoy__duracion">{formatearTiempo(sesion.duracion_segundos)}</span>
                        <div className="timers-hoy__acciones">
                          <button
                            className="btn-icono"
                            title="Editar"
                            onClick={() => setSesionEditando(sesion)}
                          >
                            ✎
                          </button>
                          {confirmBorrar === sesion.id ? (
                            <div className="btn-alerta">
                              <span className="btn-alerta__texto">¿BORRAR?</span>
                              <button className="btn btn-sm btn-peligro" onClick={() => borrarSesion(sesion.id)}>SÍ</button>
                              <button className="btn btn-sm btn-secundario" onClick={() => setConfirmBorrar(null)}>NO</button>
                            </div>
                          ) : (
                            <button
                              className="btn-icono"
                              title="Eliminar"
                              onClick={() => setConfirmBorrar(sesion.id)}
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>

        </div>
      </main>

      {sesionEditando && (
        <ModalEditarSesion
          sesion={sesionEditando}
          onCerrar={() => setSesionEditando(null)}
          onGuardada={onSesionEditada}
        />
      )}
    </>
  )
}
