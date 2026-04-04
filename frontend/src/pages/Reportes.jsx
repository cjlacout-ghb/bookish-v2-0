import { useState, useEffect } from 'react'
import Header from '../components/Header.jsx'
import { formatearTiempo, formatearRelojBA, getHoyBA } from '../components/Timer.jsx'
import { API } from '../services/api.js'

/* ── Helpers ─────────────────────────────────────────────────────────────── */
function hoy() {
  return getHoyBA()
}

function mesActual() {
  const dStr = getHoyBA() // YYYY-MM-DD
  const parts = dStr.split('-')
  return { year: parseInt(parts[0]), month: parseInt(parts[1]) }
}

function anioActual() {
  return parseInt(getHoyBA().split('-')[0])
}

function barWidth(val, max) {
  if (!max) return 0
  return Math.min(100, Math.round((val / max) * 100))
}

const MESES_ES = ['', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
                      'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

/* ── Tab: Día ────────────────────────────────────────────────────────────── */
function TabDia() {
  const [fecha, setFecha] = useState(hoy())
  const [data, setData] = useState(null)
  const [cargando, setCargando] = useState(false)

  useEffect(() => { cargar() }, [fecha])

  async function cargar() {
    setCargando(true)
    try {
      const d = await API.getReporteDia(fecha)
      setData(d)
    } catch (e) {
      console.error(e)
    } finally {
      setCargando(false)
    }
  }

  const sesiones = data?.sesiones || []
  const totalSecs = data?.total_segundos || 0

  // Group by book for the proportion bars
  const porLibro = {}
  sesiones.forEach(s => {
    if (!porLibro[s.libro_id]) {
      porLibro[s.libro_id] = { titulo: s.libro_titulo, segundos: 0 }
    }
    porLibro[s.libro_id].segundos += s.duracion_segundos || 0
  })
  const librosArr = Object.values(porLibro).sort((a, b) => b.segundos - a.segundos)

  return (
    <div className="reporte-tab">
      <div className="reporte-controles">
        <label className="campo__etiqueta">Fecha</label>
        <input
          type="date"
          className="reporte-date-input"
          value={fecha}
          max={hoy()}
          onChange={e => setFecha(e.target.value)}
        />
      </div>

      {cargando ? (
        <div className="cargando">◆ Cargando ◆</div>
      ) : sesiones.length === 0 ? (
        <div className="estado-vacio" style={{ padding: 'var(--espacio-xl)' }}>
          <span className="estado-vacio__ornamento">◇</span>
          Sin sesiones registradas para este día.
        </div>
      ) : (
        <>
          <div className="reporte-resumen">
            <div className="reporte-stat">
              <span className="reporte-stat__val">{formatearTiempo(totalSecs)}</span>
              <span className="reporte-stat__label">Total del día</span>
            </div>
            <div className="reporte-stat">
              <span className="reporte-stat__val">{data.libros_count}</span>
              <span className="reporte-stat__label">Libros leídos</span>
            </div>
          </div>

          {/* Barras por libro */}
          {librosArr.length > 1 && (
            <div className="reporte-barras">
              {librosArr.map((lib, i) => (
                <div key={i} className="reporte-barra-fila">
                  <span className="reporte-barra-label">{lib.titulo}</span>
                  <div className="reporte-barra-track">
                    <div
                      className="reporte-barra-fill"
                      style={{ width: `${barWidth(lib.segundos, totalSecs)}%` }}
                    />
                  </div>
                  <span className="reporte-barra-val">{formatearTiempo(lib.segundos)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Lista de sesiones */}
          <div className="reporte-sesiones">
            <h3 className="seccion-titulo" style={{ fontSize: '0.7rem' }}>Sesiones del día</h3>
            {sesiones.map(s => {
              const inicio = formatearRelojBA(s.iniciado_en)
              const fin = formatearRelojBA(s.finalizado_en)
              return (
                <div key={s.id} className="reporte-sesion-fila">
                  <div className="reporte-sesion-info">
                    <span className="reporte-sesion-titulo">{s.libro_titulo}</span>
                    <span className="reporte-sesion-rango">{inicio} – {fin}</span>
                    {s.session_note && (
                      <span className="reporte-sesion-nota">"{s.session_note}"</span>
                    )}
                  </div>
                  <span className="reporte-sesion-dur">{formatearTiempo(s.duracion_segundos)}</span>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

/* ── Tab: Mes ─────────────────────────────────────────────────────────────── */
function TabMes() {
  const cur = mesActual()
  const [year, setYear] = useState(cur.year)
  const [month, setMonth] = useState(cur.month)
  const [data, setData] = useState(null)
  const [cargando, setCargando] = useState(false)

  useEffect(() => { cargar() }, [year, month])

  async function cargar() {
    setCargando(true)
    try {
      const d = await API.getReporteMes(year, month)
      setData(d)
    } catch (e) {
      console.error(e)
    } finally {
      setCargando(false)
    }
  }

  const dias = data?.dias || []
  const maxSecs = Math.max(...dias.map(d => d.total_segundos), 1)
  const totalSecs = data?.total_segundos || 0
  const promedio = data?.promedio_segundos_dia || 0

  return (
    <div className="reporte-tab">
      <div className="reporte-controles">
        <label className="campo__etiqueta">Año</label>
        <input
          type="number"
          className="reporte-num-input"
          value={year}
          min={2020}
          max={new Date().getFullYear()}
          onChange={e => setYear(Number(e.target.value))}
        />
        <label className="campo__etiqueta">Mes</label>
        <select
          className="reporte-select"
          value={month}
          onChange={e => setMonth(Number(e.target.value))}
        >
          {MESES_ES.slice(1).map((nombre, i) => (
            <option key={i + 1} value={i + 1}>{nombre}</option>
          ))}
        </select>
      </div>

      {cargando ? (
        <div className="cargando">◆ Cargando ◆</div>
      ) : (
        <>
          <div className="reporte-resumen">
            <div className="reporte-stat">
              <span className="reporte-stat__val">{formatearTiempo(totalSecs)}</span>
              <span className="reporte-stat__label">Total del mes</span>
            </div>
            <div className="reporte-stat">
              <span className="reporte-stat__val">{formatearTiempo(promedio)}</span>
              <span className="reporte-stat__label">Promedio diario</span>
            </div>
          </div>

          <div className="reporte-mes-grid">
            {dias.map(dia => (
              <div key={dia.dia} className={`reporte-mes-fila${dia.total_segundos === 0 ? ' reporte-mes-fila--vacia' : ''}`}>
                <span className="reporte-mes-dia">{dia.dia}</span>
                <div className="reporte-barra-track reporte-mes-track">
                  <div
                    className="reporte-barra-fill"
                    style={{ width: `${barWidth(dia.total_segundos, maxSecs)}%` }}
                  />
                </div>
                <span className="reporte-mes-val">
                  {dia.total_segundos > 0 ? formatearTiempo(dia.total_segundos) : '—'}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

/* ── Tab: Año ─────────────────────────────────────────────────────────────── */
function TabAnio() {
  const [year, setYear] = useState(anioActual())
  const [data, setData] = useState(null)
  const [cargando, setCargando] = useState(false)

  useEffect(() => { cargar() }, [year])

  async function cargar() {
    setCargando(true)
    try {
      const d = await API.getReporteAnio(year)
      setData(d)
    } catch (e) {
      console.error(e)
    } finally {
      setCargando(false)
    }
  }

  const meses = data?.meses || []
  const maxSecs = Math.max(...meses.map(m => m.total_segundos), 1)
  const totalSecs = data?.total_segundos || 0

  return (
    <div className="reporte-tab">
      <div className="reporte-controles">
        <label className="campo__etiqueta">Año</label>
        <input
          type="number"
          className="reporte-num-input"
          value={year}
          min={2020}
          max={new Date().getFullYear()}
          onChange={e => setYear(Number(e.target.value))}
        />
      </div>

      {cargando ? (
        <div className="cargando">◆ Cargando ◆</div>
      ) : (
        <>
          <div className="reporte-resumen">
            <div className="reporte-stat">
              <span className="reporte-stat__val">{formatearTiempo(totalSecs)}</span>
              <span className="reporte-stat__label">Total del año</span>
            </div>
            {data?.libro_mas_leido && (
              <div className="reporte-stat reporte-stat--destacado">
                <span className="reporte-stat__val reporte-stat__val--sm">{data.libro_mas_leido}</span>
                <span className="reporte-stat__label">Más leído</span>
              </div>
            )}
          </div>

          <div className="reporte-anio-grid">
            {meses.map(mes => (
              <div key={mes.mes} className={`reporte-anio-fila${mes.total_segundos === 0 ? ' reporte-anio-fila--vacia' : ''}`}>
                <span className="reporte-anio-mes">{mes.nombre_mes}</span>
                <div className="reporte-barra-track reporte-anio-track">
                  <div
                    className="reporte-barra-fill"
                    style={{ width: `${barWidth(mes.total_segundos, maxSecs)}%` }}
                  />
                </div>
                <span className="reporte-anio-val">
                  {mes.total_segundos > 0 ? formatearTiempo(mes.total_segundos) : '—'}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

/* ── Main page ───────────────────────────────────────────────────────────── */
export default function Reportes() {
  const [tab, setTab] = useState('dia')

  return (
    <>
      <Header />
      <main className="pagina">
        <div className="reportes-page animar-entrada">

          <div className="timers-page__header">
            <h1 className="timers-page__titulo">Reportes</h1>
            <p className="timers-page__subtitulo">Historial de lectura</p>
          </div>

          {/* Tabs */}
          <nav className="reporte-tabs">
            {[
              { id: 'dia',  label: 'Día' },
              { id: 'mes',  label: 'Mes' },
              { id: 'anio', label: 'Año' },
            ].map(t => (
              <button
                key={t.id}
                id={`tab-reporte-${t.id}`}
                className={`reporte-tab-btn${tab === t.id ? ' reporte-tab-btn--activo' : ''}`}
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </nav>

          {tab === 'dia'  && <TabDia />}
          {tab === 'mes'  && <TabMes />}
          {tab === 'anio' && <TabAnio />}

        </div>
      </main>
    </>
  )
}
