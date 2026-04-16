import { useNavigate } from 'react-router-dom'
import PropTypes from 'prop-types'
import { getFileURL } from '../services/api'
import { formatTitle, formatAuthor } from '../services/textUtils'


/**
 * Tarjeta de libro para la grilla de la biblioteca.
 */
function TarjetaLibro({ libro }) {
  const navigate = useNavigate()

  const tienePortada = Boolean(libro.portada_filename)
  const letraInicial = libro.titulo?.[0]?.toUpperCase() || '◆'

  return (
    <article
      className="noir-card animar-entrada"
      onClick={() => navigate(`/libro/${libro.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/libro/${libro.id}`)}
      aria-label={`${libro.titulo} de ${libro.autor}`}
    >
      {/* Portada */}
      <div className="noir-card-img-wrap">
        {tienePortada ? (
          <img
            src={getFileURL(libro.portada_filename)}
            alt={`Portada de ${libro.titulo}`}
          />
        ) : (
          <div className="noir-card-placeholder">
            <span className="noir-card-placeholder-ornament">◆</span>
            <span className="noir-card-placeholder-letter">{letraInicial}</span>
          </div>
        )}
        <div className="noir-card-gradient"></div>
        {libro.estado === 'leyendo' ? (
          <div className="noir-card-badge">
            <span className="noir-card-badge-text">
              {(() => {
                const actual = parseInt(libro.pagina_actual || 0)
                const total = parseInt(libro.paginas || 0)
                if (total <= 0) return null
                return `${Math.round((actual / total) * 100)}%`
              })() ?? '◆'}
            </span>
          </div>
        ) : null}
      </div>

      {/* Info */}
      <div className="noir-card-content">
        <h4 className="noir-card-title">{formatTitle(libro.titulo)}</h4>
        <p className="noir-card-author">{formatAuthor(libro.autor)}</p>


        <button className="noir-card-btn">
          {libro.estado === 'leyendo' ? 'Continuar' : (libro.estado === 'por_leer' ? 'Comenzar' : 'Ver Detalles')}
        </button>
      </div>
    </article>
  )
}

TarjetaLibro.propTypes = {
  libro: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    titulo: PropTypes.string,
    autor: PropTypes.string,
    portada_filename: PropTypes.string,
    estado: PropTypes.string,
    total_segundos: PropTypes.number,
    paginas: PropTypes.number,
    pagina_actual: PropTypes.number,
  }).isRequired
}

export default TarjetaLibro
