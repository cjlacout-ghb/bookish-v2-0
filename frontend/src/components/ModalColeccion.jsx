import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { API, getFileURL } from '../services/api.js'
import { formatTitle, formatAuthor } from '../services/textUtils.js'


export default function ModalColeccion({ filtro, onClose }) {
  const navigate = useNavigate()
  const [librosAsociados, setLibrosAsociados] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    if (!filtro || !filtro.valor) return

    async function buscarLibros() {
      setCargando(true)
      try {
        const data = await API.getLibros()
        const filtrados = data.filter((libro) => {
          if (filtro.tipo === 'etiqueta') {
            if (!libro.etiquetas) return false
            const listado = libro.etiquetas.split(',').map(e => e.trim().toLowerCase())
            return listado.includes(filtro.valor.toLowerCase())
          } else if (filtro.tipo === 'género') {
            if (!libro.genero) return false
            const listado = libro.genero.split(',').map(g => g.trim().toLowerCase())
            return listado.includes(filtro.valor.toLowerCase())
          } else if (filtro.tipo === 'autor') {
            if (!libro.autor) return false
            return libro.autor.toLowerCase() === filtro.valor.toLowerCase()
          } else if (filtro.tipo === 'editorial') {
            if (!libro.editorial) return false
            return libro.editorial.toLowerCase() === filtro.valor.toLowerCase()
          } else if (filtro.tipo === 'formato') {
            if (!libro.formato) return false
            return libro.formato.toLowerCase() === filtro.valor.toLowerCase()
          }
          return false
        })
        setLibrosAsociados(filtrados)
      } catch (err) {
        console.error(`Error al cargar libros por ${filtro.tipo}`, err)
      } finally {
        setCargando(false)
      }
    }
    
    buscarLibros()
  }, [filtro])

  if (!filtro || !filtro.valor) return null

  // Capitalizamos el tipo para mostrarlo bonito (Ej: Género, Autor, Etiqueta)
  const tipoCapitalizado = filtro.tipo.charAt(0).toUpperCase() + filtro.tipo.slice(1)

  return (
    <div className="tag-modal-overlay" onClick={onClose}>
      <div className="tag-modal-contenido" onClick={(e) => e.stopPropagation()}>
        <div className="tag-modal-cabecera">
          <h3 className="tag-modal-titulo">
            <span className="tag-modal-ornamento">◈</span>
            {tipoCapitalizado}: <span style={{ color: 'var(--oro-primario)' }}>{filtro.tipo === 'autor' ? formatAuthor(filtro.valor) : (filtro.tipo === 'título' ? formatTitle(filtro.valor) : filtro.valor)}</span>
          </h3>

          <button className="tag-modal-cerrar" onClick={onClose}>✕</button>
        </div>

        {cargando ? (
          <div className="estado-vacio" style={{ padding: 'var(--espacio-lg)' }}>
            <span className="estado-vacio__ornamento">◈</span>
            <span style={{color: 'var(--oro-silenciado)'}}>Cargando el archivo...</span>
          </div>
        ) : librosAsociados.length > 0 ? (
          <div className="tag-modal-cuadricula">
            {librosAsociados.map(libro => (
              <div 
                key={libro.id} 
                className="tag-modal-libro"
                onClick={() => {
                  onClose()
                  navigate(`/libro/${libro.id}`)
                }}
              >
                <div className="tag-modal-portada">
                  {libro.portada_filename ? (
                    <img src={getFileURL(libro.portada_filename)} alt={libro.titulo} />
                  ) : (
                    <span className="tarjeta-libro__sin-portada-ornamento" style={{fontSize: '1.2rem'}}>◆</span>
                  )}
                </div>
                <div className="tag-modal-info">
                  <h4 className="tag-modal-libro-titulo">{formatTitle(libro.titulo)}</h4>
                  <p className="tag-modal-libro-autor">{formatAuthor(libro.autor)}</p>
                  <span className="etiqueta-chip etiqueta-chip--activa" style={{fontSize: '0.65rem', padding: '0.1rem 0.3rem', marginTop: 'auto', display: 'inline-block', width: 'fit-content'}}>
                    {filtro.valor}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="estado-vacio" style={{ padding: 'var(--espacio-lg)' }}>
            <span className="estado-vacio__ornamento">◈</span>
            No se encontraron más libros para este filtro.
          </div>
        )}
      </div>
    </div>
  )
}
