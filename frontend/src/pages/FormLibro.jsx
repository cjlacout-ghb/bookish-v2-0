import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import DatePicker, { registerLocale } from 'react-datepicker'
import { es } from 'date-fns/locale/es'
import "react-datepicker/dist/react-datepicker.css"
import Estrellas from '../components/Estrellas.jsx'
import Header from '../components/Header.jsx'
import { getHoyBA } from '../components/Timer.jsx'
import { API } from '../services/api.js'

registerLocale('es', es)

const ESTADOS_OPCIONES = [
  { valor: 'por_leer', etiqueta: 'Por leer' },
  { valor: 'leyendo',  etiqueta: 'Leyendo' },
  { valor: 'leido',    etiqueta: 'Leído' },
]

const FORMATOS_OPCIONES = [
  { valor: 'analógico', etiqueta: 'Analógico' },
  { valor: 'digital', etiqueta: 'Digital' },
]

const CAMPOS_VACIOS = {
  titulo: '',
  autor: '',
  genero: '',
  paginas: '',
  pagina_actual: '',
  editorial: '',
  anio: '',
  isbn: '',
  formato: 'analógico',
  estado: 'por_leer',
  calificacion: 0,
  fecha_inicio: '',
  fecha_fin: '',
  ultima_edicion_anio: '',
  ultima_edicion_detalle: '',
  etiquetas: '',
  resena: '',
}

export default function FormLibro() {
  const { id } = useParams()
  const navigate = useNavigate()
  const esEdicion = Boolean(id)

  const [campos, setCampos] = useState(CAMPOS_VACIOS)
  const [errores, setErrores] = useState({})
  const [guardando, setGuardando] = useState(false)
  const [cargando, setCargando] = useState(esEdicion)
  const [confirmEliminar, setConfirmEliminar] = useState(false)
  const [formHabilitado, setFormHabilitado] = useState(!esEdicion)

  // Portada
  const [portadaPreview, setPortadaPreview] = useState(null)
  const [portadaArchivo, setPortadaArchivo] = useState(null)
  const [portadaExistente, setPortadaExistente] = useState(null)
  const inputArchivoRef = useRef(null)

  useEffect(() => {
    if (esEdicion) cargarLibro()
  }, [id])

  async function cargarLibro() {
    setCargando(true)
    try {
      const data = await API.getLibro(id)
      setCampos({
        titulo:      data.titulo || '',
        autor:       data.autor || '',
        genero:      data.genero || '',
        paginas:     data.paginas || '',
        pagina_actual: data.pagina_actual || '',
        editorial:   data.editorial || '',
        anio:        data.anio || '',
        isbn:        data.isbn || '',
        formato:     data.formato || 'analógico',
        estado:      data.estado || 'por_leer',
        calificacion: data.calificacion || 0,
        fecha_inicio: data.fecha_inicio || '',
        fecha_fin:   data.fecha_fin || '',
        ultima_edicion_anio: data.ultima_edicion_anio || '',
        ultima_edicion_detalle: data.ultima_edicion_detalle || '',
        etiquetas:   data.etiquetas || '',
        resena:      data.resena || '',
      })
      if (data.portada_filename) {
        setPortadaExistente(data.portada_filename)
      }
    } catch {
      navigate('/biblioteca')
    } finally {
      setCargando(false)
    }
  }

  async function eliminarLibro() {
    try {
      await API.eliminarLibro(id)
      navigate('/biblioteca')
    } catch {}
  }

  function handleCampo(e) {
    const { name, value } = e.target
    setCampos((prev) => ({ ...prev, [name]: value }))
    if (errores[name]) setErrores((prev) => ({ ...prev, [name]: '' }))
  }

  function handleDateChange(name, date) {
    // Si date es null, guardamos string vacío
    const value = date ? date.toISOString().split('T')[0] : ''
    setCampos((prev) => ({ ...prev, [name]: value }))
    if (errores[name]) setErrores((prev) => ({ ...prev, [name]: '' }))
  }

  function handlePortada(e) {
    const archivo = e.target.files?.[0]
    if (!archivo) return
    setPortadaArchivo(archivo)
    const reader = new FileReader()
    reader.onload = (ev) => setPortadaPreview(ev.target.result)
    reader.readAsDataURL(archivo)
  }

  function validar() {
    const nuevosErrores = {}
    if (!campos.titulo.trim()) nuevosErrores.titulo = 'El título es obligatorio.'
    if (!campos.autor.trim()) nuevosErrores.autor = 'El autor es obligatorio.'
    if (campos.paginas && isNaN(parseInt(campos.paginas))) nuevosErrores.paginas = 'Ingresá un número válido.'
    if (campos.pagina_actual && isNaN(parseInt(campos.pagina_actual))) nuevosErrores.pagina_actual = 'Ingresá un número válido.'
    if (campos.paginas && campos.pagina_actual && parseInt(campos.pagina_actual) > parseInt(campos.paginas)) {
      nuevosErrores.pagina_actual = 'No puede ser mayor al total.'
    }
    if (campos.anio && isNaN(parseInt(campos.anio))) nuevosErrores.anio = 'Ingresá un año válido.'
    if (campos.ultima_edicion_anio && isNaN(parseInt(campos.ultima_edicion_anio))) nuevosErrores.ultima_edicion_anio = 'Ingresá un año válido.'
    if (campos.anio && campos.ultima_edicion_anio && parseInt(campos.ultima_edicion_anio) < parseInt(campos.anio)) {
      nuevosErrores.ultima_edicion_anio = 'No puede ser anterior al año original.'
    }
    if (campos.fecha_inicio && campos.fecha_fin) {
      if (new Date(campos.fecha_fin) < new Date(campos.fecha_inicio)) {
        nuevosErrores.fecha_fin = 'F. fin debe ser igual o mayor a F. inicio.'
      }
    }
    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  async function handleGuardar(e) {
    e.preventDefault()
    if (!validar()) return
    setGuardando(true)

    const payload = {
      titulo:       campos.titulo.trim(),
      autor:        campos.autor.trim(),
      genero:       campos.genero.trim() || null,
      paginas:      campos.paginas ? parseInt(campos.paginas) : null,
      pagina_actual: campos.pagina_actual ? parseInt(campos.pagina_actual) : 0,
      editorial:    campos.editorial.trim() || null,
      anio:         campos.anio ? parseInt(campos.anio) : null,
      isbn:         campos.isbn.trim() || null,
      formato:      campos.formato,
      estado:       campos.estado,
      calificacion: campos.calificacion,
      fecha_inicio: campos.fecha_inicio || null,
      fecha_fin:    campos.fecha_fin || null,
      ultima_edicion_anio: campos.ultima_edicion_anio ? parseInt(campos.ultima_edicion_anio) : null,
      ultima_edicion_detalle: campos.ultima_edicion_detalle.trim() || null,
      etiquetas:    campos.etiquetas.trim() || null,
      resena:       campos.resena.trim() || null,
    }

    try {
      let libroGuardado
      if (esEdicion) {
        libroGuardado = await API.actualizarLibro(id, payload)
      } else {
        libroGuardado = await API.crearLibro(payload)
      }

      // Subir portada si hay una nueva
      if (portadaArchivo) {
        const formData = new FormData()
        formData.append('archivo', portadaArchivo)
        await API.subirPortada(libroGuardado.id, formData)
      }

      // Comportamiento post-guardado
      if (esEdicion) {
        setFormHabilitado(false) // Volver a modo sólo lectura visualmente para confirmar
      } else {
        navigate('/biblioteca') // Si es nuevo, vuelve a la biblioteca
      }
    } catch {
      setErrores({ _general: 'Ocurrió un error al guardar. Intentá de nuevo.' })
    } finally {
      setGuardando(false)
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

  return (
    <>
      <Header />

      <main className="pagina">
        <div className="form-libro animar-entrada">


          {errores._general && (
            <div className="mensaje-error-general">
              {errores._general}
            </div>
          )}

          <form onSubmit={handleGuardar} noValidate>
            <fieldset disabled={formHabilitado ? undefined : true} style={{ border: 'none', padding: 0, margin: 0 }}>

            {/* Título + Autor */}
            <div className="form-libro__fila form-libro__fila--destacada">
              <div className={`campo${errores.titulo ? ' campo--error' : ''}`}>
                <label className="campo__etiqueta" htmlFor="f-titulo">título *</label>
                <textarea
                  id="f-titulo"
                  name="titulo"
                  className="campo__entrada"
                  placeholder="El nombre del libro"
                  value={campos.titulo}
                  onChange={handleCampo}
                  autoFocus={!esEdicion}
                  rows={1}
                />
                {errores.titulo && <span className="campo__mensaje-error">{errores.titulo}</span>}
              </div>

              <div className={`campo${errores.autor ? ' campo--error' : ''}`}>
                <label className="campo__etiqueta" htmlFor="f-autor">autor *</label>
                <textarea
                  id="f-autor"
                  name="autor"
                  className="campo__entrada"
                  placeholder="Nombre del autor"
                  value={campos.autor}
                  onChange={handleCampo}
                  rows={1}
                />
                {errores.autor && <span className="campo__mensaje-error">{errores.autor}</span>}
              </div>
            </div>

            {/* Género + Páginas + Año */}
            <div className="form-libro__fila-triple">
              <div className="campo">
                <label className="campo__etiqueta" htmlFor="f-genero">género</label>
                <input id="f-genero" name="genero" className="campo__entrada" placeholder="Novela, Ensayo..." value={campos.genero} onChange={handleCampo} />
              </div>

              <div className={`campo${errores.paginas ? ' campo--error' : ''}`}>
                <label className="campo__etiqueta" htmlFor="f-paginas">páginas</label>
                <input id="f-paginas" name="paginas" type="number" min="1" className="campo__entrada" placeholder="320" value={campos.paginas} onChange={handleCampo} />
                {errores.paginas && <span className="campo__mensaje-error">{errores.paginas}</span>}
              </div>

              <div className={`campo${errores.anio ? ' campo--error' : ''}`}>
                <label className="campo__etiqueta" htmlFor="f-anio">año</label>
                <input id="f-anio" name="anio" type="number" min="1" max="2099" className="campo__entrada" placeholder="2024" value={campos.anio} onChange={handleCampo} />
                {errores.anio && <span className="campo__mensaje-error">{errores.anio}</span>}
              </div>
            </div>

            {/* Editorial + ISBN + Formato */}
            <div className="form-libro__fila-triple">
              <div className="campo">
                <label className="campo__etiqueta" htmlFor="f-editorial">editorial</label>
                <input id="f-editorial" name="editorial" className="campo__entrada" placeholder="Nombre de la editorial" value={campos.editorial} onChange={handleCampo} />
              </div>
              <div className="campo">
                <label className="campo__etiqueta" htmlFor="f-isbn">isbn</label>
                <input id="f-isbn" name="isbn" className="campo__entrada" placeholder="978-..." value={campos.isbn} onChange={handleCampo} />
              </div>
              <div className="campo">
                <label className="campo__etiqueta" htmlFor="f-formato">formato</label>
                <select
                  id="f-formato"
                  name="formato"
                  className="campo__entrada campo__entrada--select"
                  value={campos.formato}
                  onChange={handleCampo}
                >
                  {FORMATOS_OPCIONES.map((op) => (
                    <option key={op.valor} value={op.valor}>{op.etiqueta}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Estado + Página + Calificación */}
            <div className="form-libro__fila-triple">
              <div className="campo">
                <label className="campo__etiqueta" htmlFor="f-estado">estado</label>
                <select
                  id="f-estado"
                  name="estado"
                  className="campo__entrada campo__entrada--select"
                  value={campos.estado}
                  onChange={handleCampo}
                >
                  {ESTADOS_OPCIONES.map((op) => (
                    <option key={op.valor} value={op.valor}>{op.etiqueta}</option>
                  ))}
                </select>
              </div>

              {campos.estado === 'leyendo' && (
                <div className={`campo${errores.pagina_actual ? ' campo--error' : ''}`}>
                  <label className="campo__etiqueta" htmlFor="f-pagina-actual">página actual</label>
                  <input
                    id="f-pagina-actual"
                    name="pagina_actual"
                    type="number"
                    min="0"
                    max={campos.paginas || undefined}
                    className="campo__entrada"
                    placeholder="0"
                    value={campos.pagina_actual}
                    onChange={handleCampo}
                  />
                  {errores.pagina_actual && <span className="campo__mensaje-error">{errores.pagina_actual}</span>}
                </div>
              )}

              <div className="campo">
                <span className="campo__etiqueta">calificación</span>
                <div style={{ paddingTop: '0.6rem' }}>
                  <Estrellas
                    valor={campos.calificacion}
                    onChange={(val) => setCampos((prev) => ({ ...prev, calificacion: val }))}
                    soloLectura={formHabilitado ? false : true}
                  />
                </div>
              </div>
            </div>

            {/* Fechas */}
            <div className="form-libro__fila-cuadruple">
              <div className="campo">
                <label className="campo__etiqueta" htmlFor="f-fecha-inicio">fecha inicio</label>
                <DatePicker
                  selected={campos.fecha_inicio ? new Date(campos.fecha_inicio + 'T12:00:00') : null}
                  onChange={(date) => handleDateChange('fecha_inicio', date)}
                  dateFormat="dd-MM-yyyy"
                  className="campo__entrada"
                  locale="es"
                  placeholderText="dd-mm-aaaa"
                  autoComplete="off"
                  id="f-fecha-inicio"
                  disabled={formHabilitado ? undefined : true}
                />
              </div>

              <div className="campo">
                <span className="campo__etiqueta">días desde inicio</span>
                <div className="campo__valor-calculado" id="dias-desde-inicio" style={{ textAlign: 'left' }}>
                  {(() => {
                    if (!campos.fecha_inicio) return '0'
                    const inicio = new Date(campos.fecha_inicio + 'T12:00:00')
                    const hoyBA = getHoyBA()
                    const hoy = new Date(hoyBA + 'T12:00:00')
                    const diff = hoy - inicio
                    const dias = Math.ceil(diff / (1000 * 60 * 60 * 24))
                    return dias >= 0 ? dias : '0'
                  })()} <span style={{ fontSize: '0.75rem', color: 'var(--texto-tenue)' }}>días</span>
                </div>
              </div>

              <div className={`campo${errores.fecha_fin ? ' campo--error' : ''}`}>
                <label className="campo__etiqueta" htmlFor="f-fecha-fin">fecha fin</label>
                <DatePicker
                  selected={campos.fecha_fin ? new Date(campos.fecha_fin + 'T12:00:00') : null}
                  onChange={(date) => handleDateChange('fecha_fin', date)}
                  dateFormat="dd-MM-yyyy"
                  className="campo__entrada"
                  locale="es"
                  placeholderText="dd-mm-aaaa"
                  autoComplete="off"
                  id="f-fecha-fin"
                  minDate={campos.fecha_inicio ? new Date(campos.fecha_inicio + 'T12:00:00') : null}
                  disabled={formHabilitado ? undefined : true}
                />
                {errores.fecha_fin && <span className="campo__mensaje-error">{errores.fecha_fin}</span>}
              </div>

              <div className="campo">
                <span className="campo__etiqueta">días de lectura</span>
                <div className="campo__valor-calculado" id="dias-lectura-resumen" style={{ textAlign: 'left' }}>
                  {(() => {
                    if (!campos.fecha_inicio || !campos.fecha_fin) return '0'
                    const inicio = new Date(campos.fecha_inicio + 'T12:00:00')
                    const fin = new Date(campos.fecha_fin + 'T12:00:00')
                    const diff = fin - inicio
                    const dias = Math.ceil(diff / (1000 * 60 * 60 * 24))
                    return dias >= 0 ? dias : '0'
                  })()} <span style={{ fontSize: '0.75rem', color: 'var(--texto-tenue)' }}>días</span>
                </div>
              </div>
            </div>

            {/* Última Edición (Bibliográfico) */}
            <div className="form-libro__fila">
              <div className={`campo${errores.ultima_edicion_anio ? ' campo--error' : ''}`} style={{ flex: '0 0 160px' }}>
                <label className="campo__etiqueta" htmlFor="f-ultima-anio">última edición (año)</label>
                <input
                  id="f-ultima-anio"
                  name="ultima_edicion_anio"
                  type="number"
                  min={campos.anio || 1}
                  max="2099"
                  className="campo__entrada"
                  placeholder="2024"
                  value={campos.ultima_edicion_anio}
                  onChange={handleCampo}
                />
                {errores.ultima_edicion_anio && <span className="campo__mensaje-error">{errores.ultima_edicion_anio}</span>}
              </div>
              <div className="campo">
                <label className="campo__etiqueta" htmlFor="f-ultima-detalle">detalles de última edición</label>
                <input
                  id="f-ultima-detalle"
                  name="ultima_edicion_detalle"
                  type="text"
                  className="campo__entrada"
                  placeholder="Ej: Edición del 50 aniversario, tapa dura..."
                  value={campos.ultima_edicion_detalle}
                  onChange={handleCampo}
                />
              </div>
            </div>

            {/* Etiquetas */}
            <div className="campo form-libro__campo-unico">
              <label className="campo__etiqueta" htmlFor="f-etiquetas">
                etiquetas <span style={{ color: 'var(--texto-tenue)' }}>(separadas por coma)</span>
              </label>
              <input
                id="f-etiquetas"
                name="etiquetas"
                className="campo__entrada"
                placeholder="recomendado por mamá, releer algún día, favorito"
                value={campos.etiquetas}
                onChange={handleCampo}
              />
            </div>

            {/* Reseña */}
            <div className="campo form-libro__campo-unico">
              <label className="campo__etiqueta" htmlFor="f-resena">reseña personal</label>
              <textarea
                id="f-resena"
                name="resena"
                className="campo__entrada campo__entrada--textarea"
                placeholder="Tu opinión sobre el libro..."
                value={campos.resena}
                onChange={handleCampo}
                rows={4}
              />
            </div>

            {/* Portada */}
            <div className="form-libro__carga-portada" style={{ marginBottom: 'var(--espacio-xl)' }}>
              {/* Preview */}
              {(portadaPreview || portadaExistente) && (
                <div className="form-libro__portada-preview">
                  <img
                    src={portadaPreview || `/portadas/${portadaExistente}`}
                    alt="Vista previa de portada"
                  />
                </div>
              )}
              <div className="campo">
                <span className="campo__etiqueta">Portada del libro</span>
                <div style={{ paddingTop: '0.4rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <input
                    ref={inputArchivoRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="input-archivo"
                    id="f-portada"
                    onChange={handlePortada}
                    disabled={formHabilitado ? undefined : true}
                  />
                  <label htmlFor="f-portada" className="btn-archivo" style={{ opacity: !formHabilitado ? 0.5 : 1, pointerEvents: !formHabilitado ? 'none' : 'auto' }}>
                    {portadaPreview || portadaExistente ? '↺ Cambiar imagen' : '↑ Subir portada'}
                  </label>
                  <span style={{ fontSize: '0.8rem', color: 'var(--texto-tenue)' }}>
                    JPG, PNG o WEBP
                  </span>
                </div>
              </div>
            </div>

            </fieldset>

            {/* Botones */}
            <div className="form-libro__acciones">
              <button
                type="button"
                className="btn btn-secundario"
                onClick={(e) => { e.preventDefault(); navigate(esEdicion ? `/libro/${id}` : '/biblioteca'); }}
                id="btn-cancelar-form"
              >
                Volver
              </button>
              
              <div className="form-libro__acciones-derecha">
                {!formHabilitado ? (
                  <button
                    type="button"
                    className="btn btn-primario"
                    onClick={(e) => { 
                      e.preventDefault(); 
                      setFormHabilitado(true); 
                    }}
                    id="btn-habilitar-edicion"
                  >
                    ✎ Editar
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="btn btn-primario"
                    disabled={guardando}
                    id="btn-guardar-libro"
                  >
                    {guardando ? 'Guardando...' : esEdicion ? 'Actualizar' : '◆ Guardar libro'}
                  </button>
                )}

                {esEdicion && (
                  !confirmEliminar ? (
                    <button
                      type="button"
                      id="btn-eliminar-libro"
                      className="btn btn-peligro"
                      onClick={(e) => { e.preventDefault(); setConfirmEliminar(true); }}
                    >
                      ✕ Eliminar
                    </button>
                  ) : (
                    <div className="btn-alerta">
                      <span className="btn-alerta__texto">¿CONFIRMAR?</span>
                      <button type="button" id="btn-confirmar-eliminar" className="btn btn-sm btn-peligro" onClick={(e) => { e.preventDefault(); eliminarLibro(); }}>
                        SÍ
                      </button>
                      <button type="button" className="btn btn-sm btn-secundario" onClick={(e) => { e.preventDefault(); setConfirmEliminar(false); }}>
                        NO
                      </button>
                    </div>
                  )
                )}
              </div>
            </div>

          </form>
        </div>
      </main>
    </>
  )
}
