import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import TarjetaLibro from '../components/TarjetaLibro.jsx'
import CarruselLibros from '../components/CarruselLibros.jsx'
import Header from '../components/Header.jsx'
import { formatearCronometro } from '../components/Timer.jsx'
import { API } from '../services/api.js'

const FILTROS = [
  { clave: 'todos',    etiqueta: 'Todos' },
  { clave: 'leido',    etiqueta: 'Leídos' },
  { clave: 'leyendo',  etiqueta: 'Leyendo' },
  { clave: 'por_leer', etiqueta: 'Por Leer' },
]

export default function Biblioteca() {
  const navigate = useNavigate()
  const location = useLocation()
  const [libros, setLibros] = useState([])
  const [stats, setStats] = useState(null)
  const [filtro, setFiltro] = useState(location.state?.filtro || 'leyendo')
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    if (location.state?.filtro) {
      setFiltro(location.state.filtro)
    }
  }, [location.state])

  useEffect(() => {
    cargarDatos()
  }, [])

  async function cargarDatos() {
    setCargando(true)
    try {
      const [dataLibros, dataStats] = await Promise.all([
        API.getLibros(),
        API.getEstadisticas(),
      ])
      setLibros(dataLibros)
      setStats(dataStats)
    } catch (err) {
      console.error('Error al cargar datos:', err)
    } finally {
      setCargando(false)
    }
  }

  const librosLeyendo = libros.filter((l) => l.estado === 'leyendo')
  
  // Cálculo de progreso para libros en lectura
  const paginasLeidasLeyendo = librosLeyendo.reduce((s, l) => s + (Number(l.pagina_actual) || 0), 0)
  const paginasTotalesLeyendo = librosLeyendo.reduce((s, l) => s + (Number(l.paginas) || 0), 0)
  const porcentajeLecturaActiva = paginasTotalesLeyendo > 0 
    ? Math.min(100, Math.round((paginasLeidasLeyendo / paginasTotalesLeyendo) * 100)) 
    : 0
  
  const librosFiltrados =
    filtro === 'todos'
      ? libros
      : filtro === 'leyendo'
      ? []
      : libros.filter((l) => l.estado === filtro)

  return (
    <>
      <Header />

      <main className="pagina">
        {cargando ? (
          <div className="cargando">◆ Cargando el archivo ◆</div>
        ) : (
          <>

            {stats && (
              <div className="bib-stats-ledger">
                <div className="bib-stat-col">
                  <span className="bib-stat-val">{stats.total_libros}</span>
                  <span className="bib-stat-label">TOTAL LIBROS</span>
                </div>
                <div className="bib-stat-col">
                  <span className="bib-stat-val">{stats.libros_leidos}</span>
                  <span className="bib-stat-label">LEÍDOS</span>
                </div>
                <div className="bib-stat-col">
                  <span className="bib-stat-val">{stats.libros_leyendo}</span>
                  <span className="bib-stat-label">LEYENDO</span>
                </div>
                <div className="bib-stat-col">
                  <span className="bib-stat-val">{stats.libros_por_leer}</span>
                  <span className="bib-stat-label">POR LEER</span>
                </div>
              </div>
            )}

            {/* Shared Header with Shared Line Across Columns */}
            <div className="bib-shared-header">
              <div className="bib-sidebar-title-col">
                <h3 className="bib-sidebar-title-inline">Colecciones</h3>
              </div>
              <div className="bib-main-header">
                <h2>{filtro === 'leyendo' ? 'Leyendo Ahora' : (FILTROS.find(f => f.clave === filtro)?.etiqueta || 'Colección')}</h2>
                <span className="bib-main-subtitle">
                  {filtro === 'leyendo' ? `${librosLeyendo.length} volúmenes` : `${librosFiltrados.length} volúmenes`}
                </span>
              </div>
            </div>

            <div className="bib-layout">
              {/* Sidebar Navigation / Filters */}
              <aside className="bib-sidebar">
                <div className="bib-sidebar-block">
                  <ul className="bib-sidebar-list">
                    {FILTROS.map((f) => (
                      <li
                        key={f.clave}
                        className={`bib-sidebar-item ${filtro === f.clave ? 'active' : ''}`}
                        onClick={() => setFiltro(f.clave)}
                      >
                        <span>{filtro === f.clave ? '◆' : '◇'}</span> {f.etiqueta}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bib-sidebar-block">
                  <p className="bib-sidebar-seccion"></p>
                  <ul className="bib-sidebar-list">
                    <li className="bib-sidebar-item" onClick={() => navigate('/sesiones')}>
                      <span>◇</span> Sesiones
                    </li>
                    <li className="bib-sidebar-item" onClick={() => navigate('/reportes')}>
                      <span>◇</span> Reportes
                    </li>
                  </ul>
                </div>
                
                {stats && (
                  <div className="bib-daily-progress">
                    <h3>Lectura en Curso</h3>
                    <div className="bib-dp-bar">
                      <div 
                        className="bib-dp-fill" 
                        style={{ width: `${porcentajeLecturaActiva}%` }}
                      ></div>
                    </div>
                    <div className="bib-dp-labels">
                      <span>{paginasLeidasLeyendo} de {paginasTotalesLeyendo} págs.</span>
                      <span style={{color: 'var(--oro-primario)'}}>
                         {porcentajeLecturaActiva}%
                      </span>
                    </div>
                  </div>
                )}
              </aside>

              {/* Main Library Grid */}
              <section className="bib-main-grid">


                {filtro === 'leyendo' ? (
                  librosLeyendo.length === 0 ? (
                    <div className="estado-vacio">
                      <span className="estado-vacio__ornamento">◈</span>
                      No estás leyendo ningún libro en este momento.
                    </div>
                  ) : (
                    <CarruselLibros libros={librosLeyendo} />
                  )
                ) : librosFiltrados.length === 0 ? (
                  <div className="estado-vacio">
                    <span className="estado-vacio__ornamento">◈</span>
                    {filtro === 'todos'
                      ? 'Tu archivo está vacío. ¡Registrá tu primer libro!'
                      : 'No hay libros en esta colección.'}
                  </div>
                ) : (
                  <CarruselLibros libros={librosFiltrados} />
                )}
              </section>
            </div>

            {/* Footer Stats */}
            {stats && (
              <section className="bib-footer-stats">
                <div className="bib-stats-ledger bib-footer-grid">
                   <div className="bib-stat-col">
                      <span className="bib-stat-val">{stats.total_paginas.toLocaleString('es-AR')}</span>
                      <span className="bib-stat-label">PÁGINAS LEÍDAS</span>
                   </div>
                   <div className="bib-stat-col">
                      <span className="bib-stat-val">{formatearCronometro(stats.total_segundos)}</span>
                      <span className="bib-stat-label">HORAS DE LECTURA</span>
                   </div>
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </>
  )
}
