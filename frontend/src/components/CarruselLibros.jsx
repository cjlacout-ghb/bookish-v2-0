import { useState, memo, useEffect } from 'react';
import PropTypes from 'prop-types';
import TarjetaLibro from './TarjetaLibro.jsx';

function CarruselLibros({ libros }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [libros]);

  const cardWidth = 240;
  const gap = 32; /* 2rem = 32px */
  const step = cardWidth + gap;
  
  const total = libros.length;
  // A rough estimate of how many books fit in view. For now, max index = total - 1
  // Could be total - 3 if we always show 3, but let's allow sliding to the last one
  const maxIndex = Math.max(0, total - 1); 

  const desplazarIzquierda = () => {
    setIndex((prev) => Math.max(0, prev - 1));
  };

  const desplazarDerecha = () => {
    setIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  return (
    <div className="carrusel-wrapper">
      {index > 0 && (
        <button className="carrusel-btn left" onClick={desplazarIzquierda} title="Desplazar a la izquierda">
          <span className="carrusel-arrow">&#9664;</span>
        </button>
      )}
      
      <div className="carrusel-viewport">
        <div 
          className="carrusel-track" 
          style={{ transform: `translateX(-${index * step}px)` }}
        >
          {libros.map((libro) => (
            <TarjetaLibro key={libro.id} libro={libro} />
          ))}
        </div>
      </div>

      {index < maxIndex && (
        <button className="carrusel-btn right" onClick={desplazarDerecha} title="Desplazar a la derecha">
          <span className="carrusel-arrow">&#9654;</span>
        </button>
      )}
    </div>
  );
}

CarruselLibros.propTypes = {
  libros: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    })
  ).isRequired,
};

export default memo(CarruselLibros);
