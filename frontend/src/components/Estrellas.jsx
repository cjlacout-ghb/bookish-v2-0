import { useState, memo } from 'react'
import PropTypes from 'prop-types'
/**
 * Selector de estrellas (1-5).
 * Props:
 *   valor        — calificación actual (0–5)
 *   onChange     — función llamada con el nuevo valor
 *   soloLectura  — si true, no permite editar
 */
function Estrellas({ valor = 0, onChange, soloLectura = false }) {
  const [hover, setHover] = useState(0)

  return (
    <div className={`estrellas${soloLectura ? ' estrellas--solo-lectura' : ''}`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className={`estrella${n <= (hover || valor) ? ' estrella--activa' : ''}`}
          onClick={() => !soloLectura && onChange?.(n === valor ? 0 : n)}
          onMouseEnter={() => !soloLectura && setHover(n)}
          onMouseLeave={() => !soloLectura && setHover(0)}
          aria-label={`${n} estrella${n !== 1 ? 's' : ''}`}
          disabled={soloLectura}
        >
          ★
        </button>
      ))}
    </div>
  )
}

Estrellas.propTypes = {
  valor: PropTypes.number,
  onChange: PropTypes.func,
  soloLectura: PropTypes.bool,
}

export default memo(Estrellas)
