import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header.jsx'
import { formatearCronometro, formatearTiempo, formatearRelojBA, getHoyBA, IconIniciar, IconPausar, IconDetener } from '../components/Timer.jsx'
import { API, getCapturaURL } from '../services/api.js'
import { formatTitle, formatAuthor } from '../services/textUtils.js'


/* ── Live counter for a single active session card ──────────────────────── */
function ContadorVivo({ sesion }) {
  const [secs, setSecs] = useState(0)
  const intervalRef = useRef(null)

  useEffect(() => {
    function parsear(str) {
      if (!str) return null
      const s = (/Z|[+-]\d{2}(:?\d{2})?$/.test(str)) ? str : str + 'Z'
      return new Date(s).getTime()
    }

    function calcular() {
      const now = Date.now()
      const inicio = parsear(sesion.iniciado_en)
      const offset = (sesion.pause_offset_seconds || 0) * 1000
      if (sesion.paused_at) {
        const pausado = parsear(sesion.paused_at)
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

import ModalEditarSesion from '../components/ModalEditarSesion.jsx'

/* ── Main page ───────────────────────────────────────────────────────────── */
export default function Sesiones() {
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
      const today = getHoyBA()
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
    setHoy((prev) => {
      if (!prev?.sesiones) return prev
      return {
        ...prev,
        sesiones: prev.sesiones.map((s) => s.id === updated.id ? updated : s),
      }
    })
  }

  const sesionesHoyCompletadas = hoy?.sesiones ? [...hoy.sesiones].reverse() : []
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
                <button 
                  className="timers-vacio__texto" 
                  onClick={() => navigate('/biblioteca')}
                >
                  Ningún libro abierto en este momento
                </button>
              </div>
            ) : (
              <div className="timers-cards">
                {[...activas].sort((a,b) => new Date(b.iniciado_en) - new Date(a.iniciado_en)).map(sesion => (
                  <div key={sesion.id} className={`timers-card${sesion.paused_at ? ' timers-card--pausada' : ''}`}>
                    {/* Portada pequeña */}
                    <div className="timers-card__portada">
                      {sesion.libro?.portada_filename ? (
                        <img src={`app://covers/${sesion.libro.portada_filename}`} alt="" />
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
                        {formatTitle(sesion.libro?.titulo || '—')}
                      </p>
                      <p className="timers-card__autor">{formatAuthor(sesion.libro?.autor || '')}</p>

                      <ContadorVivo sesion={sesion} />
                      {sesion.paused_at && (
                        <span className="timers-card__badge-pausa"><IconPausar /> En pausa</span>
                      )}
                    </div>

                    {/* Controles */}
                    <div className="timers-card__controles">
                      {sesion.paused_at ? (
                        <button
                          className="btn btn-sm btn-primario"
                          onClick={() => accionTimer(sesion.libro_id, 'resume')}
                        >
                          <IconIniciar /> Reanudar
                        </button>
                      ) : (
                        <button
                          className="btn btn-sm btn-secundario"
                          onClick={() => accionTimer(sesion.libro_id, 'pause')}
                        >
                          <IconPausar /> Pausar
                        </button>
                      )}
                      <button
                        className="btn btn-sm btn-peligro"
                        onClick={() => accionTimer(sesion.libro_id, 'stop')}
                      >
                        <IconDetener /> Detener
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
                  const inicio = formatearRelojBA(sesion.iniciado_en)
                  const fin = formatearRelojBA(sesion.finalizado_en)
                  return (
                    <div key={sesion.id} className="timers-hoy__fila">
                      <div className="timers-hoy__libro">
                        <span className="timers-hoy__titulo">{formatTitle(sesion.libro_titulo)}</span>

                        <span className="timers-hoy__rango">{inicio} – {fin}</span>
                        {sesion.session_note && (
                          <span className="timers-hoy__nota">"{sesion.session_note}"</span>
                        )}
                        {sesion.captura_filename && (
                          <div style={{ marginTop: '0.4rem' }}>
                            <a href={getCapturaURL(sesion.captura_filename)} target="_blank" rel="noopener noreferrer">
                              <img 
                                src={getCapturaURL(sesion.captura_filename)} 
                                alt="Captura" 
                                style={{ maxHeight: '40px', borderRadius: '2px', border: '1px solid var(--oro-oscuro)', cursor: 'pointer' }}
                              />
                            </a>
                          </div>
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
