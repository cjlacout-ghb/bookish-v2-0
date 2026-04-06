import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Estrellas from '../components/Estrellas.jsx'
import Timer from '../components/Timer.jsx'
import ModalNota from '../components/ModalNota.jsx'
import TagModal from '../components/TagModal.jsx'
import Header from '../components/Header.jsx'
import { API } from '../services/api.js'

const ESTADOS_OPCIONES = [
  { valor: 'por_leer', etiqueta: 'Por leer' },
  { valor: 'leyendo',  etiqueta: 'Leyendo' },
  { valor: 'leido',    etiqueta: 'Leído' },
]

export default function DetalleLibro() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [libro, setLibro] = useState(null)
  const [notas, setNotas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [mostrarModal, setMostrarModal] = useState(false)
  const [totalSegundos, setTotalSegundos] = useState(0)
  const [sesionActiva, setSesionActiva] = useState(null)
  const [errorNotas, setErrorNotas] = useState(false)
  const [etiquetaActiva, setEtiquetaActiva] = useState(null)

  useEffect(() => {
    cargarLibro()
    cargarNotas()
    cargarSesionActiva()
  }, [id])

  async function cargarLibro() {
    setCargando(true)
    try {
      const data = await API.getLibro(id)
      setLibro(data)
      setTotalSegundos(data.total_segundos || 0)
    } catch {
      navigate('/biblioteca')
    } finally {
      setCargando(false)
    }
  }

  async function cargarSesionActiva() {
    try {
      const activas = await API.getSesionesActivas()
      const mine = activas.find(s => String(s.libro_id) === String(id))
      setSesionActiva(mine || null)
    } catch {
      // no critical
    }
  }

  async function cargarNotas() {
    try {
      const data = await API.getNotas(id)
      setNotas(data)
      setErrorNotas(false)
    } catch {
      setErrorNotas(true)
    }
  }

  async function eliminarNota(notaId) {
    try {
      await API.eliminarNota(notaId)
      setNotas((prev) => prev.filter((n) => n.id !== notaId))
    } catch {}
  }

  async function eliminarLibro() {
    try {
      await API.eliminarLibro(id)
      navigate('/biblioteca')
    } catch {}
  }

  function onNotaGuardada(nota) {
    setNotas((prev) => [nota, ...prev])
  }

  function onSesionGuardada(nuevoTotal) {
    setTotalSegundos(nuevoTotal)
  }

  async function handleCambioEstado(nuevoEstado) {
    if (nuevoEstado === libro.estado) return
    
    try {
      // Actualizamos solo el estado
      const data = await API.actualizarLibro(id, { ...libro, estado: nuevoEstado })
      setLibro(data)
    } catch (err) {
      console.error('Error al actualizar estado:', err)
      // Opcional: mostrar mensaje de error al usuario
    }
  }

  if (cargando) {
    return (
      <>
        <Header />
        <main className="pagina"><div className="cargando">◆ Cargando ◆</div></main>
      </>
    )
  }

  if (!libro) return null

  const etiquetas = libro.etiquetas
    ? libro.etiquetas.split(',').map((e) => e.trim()).filter(Boolean)
    : []

  const citas = notas.filter((n) => n.es_cita)
  const notasSolas = notas.filter((n) => !n.es_cita)

  return (
    <>
      {/* Cabecera */}
      <Header />

      <main className="pagina">
        <div className="detalle-libro animar-entrada">


          {/* Encabezado: portada + meta */}
          <div className="detalle-libro__encabezado">

            {/* Portada */}
            <div className="detalle-libro__portada">
              {libro.portada_filename ? (
                <img
                  src={`/portadas/${libro.portada_filename}`}
                  alt={`Portada de ${libro.titulo}`}
                />
              ) : (
                <div className="detalle-libro__portada-placeholder">
                  <span>◆</span>
                </div>
              )}
            </div>

            {/* Información */}
            <div className="detalle-libro__meta">
              <select 
                className={`badge-estado badge-estado-select badge-estado--${libro.estado}`}
                value={libro.estado}
                onChange={(e) => handleCambioEstado(e.target.value)}
                title="Cambiar estado del libro"
              >
                {ESTADOS_OPCIONES.map((op) => (
                  <option key={op.valor} value={op.valor}>
                    {op.etiqueta.toUpperCase()}
                  </option>
                ))}
              </select>

              <h1 className="detalle-libro__titulo">{libro.titulo}</h1>
              <p className="detalle-libro__autor">{libro.autor}</p>

              <Estrellas valor={libro.calificacion} soloLectura />

              {/* Atributos */}
              <div className="detalle-libro__atributos">
                {libro.genero && (
                  <div className="atributo">
                    <span className="atributo__clave">Género</span>
                    <span className="atributo__valor">{libro.genero}</span>
                  </div>
                )}
                {libro.formato && (
                  <div className="atributo">
                    <span className="atributo__clave">Formato</span>
                    <span className="atributo__valor" style={{ textTransform: 'capitalize' }}>{libro.formato}</span>
                  </div>
                )}
                {libro.paginas && (
                  <div className="atributo">
                    <span className="atributo__clave">Páginas</span>
                    <span className="atributo__valor">{libro.paginas}</span>
                  </div>
                )}
                {libro.editorial && (
                  <div className="atributo">
                    <span className="atributo__clave">Editorial</span>
                    <span className="atributo__valor">{libro.editorial}</span>
                  </div>
                )}
                {libro.anio && (
                  <div className="atributo">
                    <span className="atributo__clave">Año</span>
                    <span className="atributo__valor">{libro.anio}</span>
                  </div>
                )}
                {libro.isbn && (
                  <div className="atributo">
                    <span className="atributo__clave">ISBN</span>
                    <span className="atributo__valor" style={{ fontFamily: 'var(--fuente-cuerpo)', fontSize: '0.85rem' }}>
                      {libro.isbn}
                    </span>
                  </div>
                )}
              </div>

              {/* Etiquetas */}
              {etiquetas.length > 0 && (
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.4rem' }}>
                  {etiquetas.map((e, i) => (
                    <span 
                      key={i} 
                      className={`etiqueta-chip ${etiquetaActiva === e ? 'etiqueta-chip--activa' : ''}`}
                      onClick={() => setEtiquetaActiva(etiquetaActiva === e ? null : e)}
                    >
                      {e}
                    </span>
                  ))}
                </div>
              )}

              {/* Acciones */}
              <div className="detalle-libro__acciones">
                <button
                  id="btn-ver-mas-datos"
                  className="btn btn-secundario"
                  onClick={() => navigate(`/libro/${id}/editar`)}
                >
                  Ver + datos
                </button>
              </div>
            </div>
          </div>

          {/* Timer (solo si está leyendo) - MOVED UP for prominence */}
          {libro.estado === 'leyendo' && (
            <div style={{ marginBottom: 'var(--espacio-xl)' }}>
              <Timer
                libroId={libro.id}
                totalSegundos={totalSegundos}
                sesionActiva={sesionActiva}
                onSesionGuardada={onSesionGuardada}
                onSesionActiva={setSesionActiva}
              />
            </div>
          )}

          {/* Reseña */}
          {libro.resena && (
            <section className="seccion-bloque" aria-label="Reseña personal">
              <h2 className="seccion-titulo">◆ Reseña personal</h2>
              <blockquote className="resena-bloque">{libro.resena}</blockquote>
            </section>
          )}


          {/* Notas y Citas */}
          <section className="seccion-bloque" aria-label="Notas y citas">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--espacio-md)' }}>
              <h2 className="seccion-titulo" style={{ marginBottom: 0 }}>◈ Notas y citas</h2>
              <button
                id="btn-nueva-nota"
                className="btn btn-primario"
                onClick={() => setMostrarModal(true)}
              >
                + Nueva
              </button>
            </div>

            {notas.length === 0 ? (
              errorNotas ? (
                <div className="estado-vacio" style={{ padding: 'var(--espacio-lg)' }}>
                  <span className="estado-vacio__ornamento" style={{ color: 'var(--texto-error)' }}>◈</span>
                  No se pudieron cargar las notas. Verificá la conexión.
                </div>
              ) : (
                <div className="estado-vacio" style={{ padding: 'var(--espacio-lg)' }}>
                  <span className="estado-vacio__ornamento">◈</span>
                  Todavía no hay notas para este libro.
                </div>
              )
            ) : (
              <>
                {/* Citas */}
                {citas.length > 0 && (
                  <>
                    <p className="seccion-titulo" style={{ fontSize: '0.58rem', marginBottom: 'var(--espacio-sm)' }}>
                      Citas textuales
                    </p>
                    {citas.map((nota) => (
                      <NotaItem key={nota.id} nota={nota} onEliminar={eliminarNota} />
                    ))}
                    {notasSolas.length > 0 && (
                      <div className="ornamento-divisor">◇</div>
                    )}
                  </>
                )}

                {/* Notas */}
                {notasSolas.map((nota) => (
                  <NotaItem key={nota.id} nota={nota} onEliminar={eliminarNota} />
                ))}
              </>
            )}
          </section>

        </div>
      </main>

      {/* Modal de nueva nota */}
      {mostrarModal && (
        <ModalNota
          libroId={libro.id}
          onCerrar={() => setMostrarModal(false)}
          onGuardada={onNotaGuardada}
        />
      )}

      {/* Modal de Etiqueta (Libros relacionados) */}
      <TagModal 
        etiquetaActiva={etiquetaActiva} 
        onClose={() => setEtiquetaActiva(null)} 
      />
    </>
  )
}

/* ── Componente interno: ítem de nota ───────────────────────────────────── */
function NotaItem({ nota, onEliminar }) {
  const [confirmando, setConfirmando] = useState(false)

  return (
    <div className={`nota-item${nota.es_cita ? ' nota-item--cita' : ''}`}>
      <span className="nota-item__ornamento">
        {nota.es_cita ? '❝' : '◇'}
      </span>
      <div className="nota-item__cuerpo">
        <p className="nota-item__tipo">{nota.es_cita ? 'Cita textual' : 'Nota'}</p>
        <p className="nota-item__texto">{nota.contenido}</p>
        {nota.numero_pagina && (
          <p className="nota-item__pagina">pág. {nota.numero_pagina}</p>
        )}
      </div>
      {!confirmando ? (
        <button
          className="nota-item__eliminar"
          onClick={() => setConfirmando(true)}
          aria-label="Eliminar nota"
          title="Eliminar"
        >
          ✕
        </button>
      ) : (
        <div className="btn-alerta">
          <span className="btn-alerta__texto">¿BORRAR?</span>
          <button
            className="btn btn-sm btn-peligro"
            onClick={() => onEliminar(nota.id)}
          >
            SÍ
          </button>
          <button
            className="btn btn-sm btn-secundario"
            onClick={() => setConfirmando(false)}
          >
            NO
          </button>
        </div>
      )}
    </div>
  )
}
