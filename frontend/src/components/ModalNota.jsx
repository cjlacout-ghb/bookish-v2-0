import { useState, memo } from 'react'
import PropTypes from 'prop-types'
import { API } from '../services/api.js'
/**
 * Modal para agregar una nota o cita a un libro.
 * Props:
 *   libroId   — id del libro
 *   onCerrar  — callback para cerrar el modal
 *   onGuardada — callback(nota) tras guardar exitosamente
 */
function ModalNota({ libroId, onCerrar, onGuardada }) {
  const [contenido, setContenido] = useState('')
  const [numeroPagina, setNumeroPagina] = useState('')
  const [esCita, setEsCita] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  async function handleGuardar() {
    if (!contenido.trim()) {
      setError('El contenido no puede estar vacío.')
      return
    }

    setGuardando(true)
    setError('')

    try {
      const nota = await API.crearNota(libroId, {
        contenido: contenido.trim(),
        numero_pagina: numeroPagina ? parseInt(numeroPagina, 10) : null,
        es_cita: esCita,
      })
      onGuardada?.(nota)
      onCerrar()
    } catch (err) {
      setError('No se pudo guardar. Intentá de nuevo.')
    } finally {
      setGuardando(false)
    }
  }

  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) onCerrar()
  }

  return (
    <div className="modal-overlay" onClick={handleOverlayClick} role="dialog" aria-modal="true">
      <div className="modal animar-entrada">
        {/* Título */}
        <p className="modal__titulo">◆ Nueva {esCita ? 'Cita' : 'Nota'}</p>

        {/* Toggle Nota / Cita */}
        <div className="modal__tipo-toggle">
          <button
            type="button"
            className={`toggle-btn${!esCita ? ' toggle-btn--activo' : ''}`}
            onClick={() => setEsCita(false)}
            id="toggle-nota"
          >
            Nota
          </button>
          <button
            type="button"
            className={`toggle-btn${esCita ? ' toggle-btn--activo' : ''}`}
            onClick={() => setEsCita(true)}
            id="toggle-cita"
          >
            Cita textual
          </button>
        </div>

        {/* Contenido */}
        <div className={`campo${error ? ' campo--error' : ''}`}>
          <label className="campo__etiqueta" htmlFor="nota-contenido">
            {esCita ? 'Transcribí la cita exacta' : 'Tu reflexión o apunte'}
          </label>
          <textarea
            id="nota-contenido"
            className="campo__entrada campo__entrada--textarea"
            placeholder={esCita ? '"El texto tal como aparece en el libro..."' : 'Escribí tu nota aquí...'}
            value={contenido}
            onChange={(e) => setContenido(e.target.value)}
            rows={5}
            autoFocus
          />
          {error && <span className="campo__mensaje-error">{error}</span>}
        </div>

        {/* Número de página */}
        <div className="campo">
          <label className="campo__etiqueta" htmlFor="nota-pagina">
            Página (opcional)
          </label>
          <input
            id="nota-pagina"
            type="number"
            className="campo__entrada"
            placeholder="ej. 142"
            value={numeroPagina}
            onChange={(e) => setNumeroPagina(e.target.value)}
            min={1}
          />
        </div>

        {/* Acciones */}
        <div className="modal__acciones">
          <button
            type="button"
            className="btn btn-secundario"
            onClick={onCerrar}
            id="btn-cancelar-nota"
          >
            Cancelar
          </button>
          <button
            type="button"
            className="btn btn-primario"
            onClick={handleGuardar}
            disabled={guardando}
            id="btn-guardar-nota"
          >
            {guardando ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  )
}

ModalNota.propTypes = {
  libroId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onCerrar: PropTypes.func.isRequired,
  onGuardada: PropTypes.func,
}

export default memo(ModalNota)
