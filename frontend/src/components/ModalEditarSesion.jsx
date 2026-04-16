import { useState } from 'react'
import { API, getCapturaURL } from '../services/api.js'
import { IconCamera } from './Timer.jsx'

export default function ModalEditarSesion({ sesion, onCerrar, onGuardada }) {
  const [iniciado, setIniciado] = useState(
    sesion.iniciado_en ? sesion.iniciado_en.slice(0, 16) : ''
  )
  const [finalizado, setFinalizado] = useState(
    sesion.finalizado_en ? sesion.finalizado_en.slice(0, 16) : ''
  )
  const [nota, setNota] = useState(sesion.session_note || '')
  const [capturaFile, setCapturaFile] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  async function guardar() {
    setError('')
    setGuardando(true)
    try {
      let dataIniciado = null;
      let dataFinalizado = null;
      if (iniciado) dataIniciado = new Date(iniciado).toISOString();
      if (finalizado) dataFinalizado = new Date(finalizado).toISOString();
      
      const updated = await API.editarSesion(
        sesion.id, 
        dataIniciado, 
        dataFinalizado, 
        nota.trim() || '', // send empty string if cleared, so the backend can distinguish
        capturaFile
      );
      onGuardada(updated)
    } catch (e) {
      setError(e.message || 'Error al guardar')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onCerrar}>
      <div className="modal-caja" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-titulo">◆ Editar Sesión</h2>
          <button className="modal-cerrar" onClick={onCerrar}>✕</button>
        </div>
        <div className="modal-cuerpo" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="campo">
            <label className="campo__etiqueta">Inicio</label>
            <input
              type="datetime-local"
              className="campo__entrada"
              style={{ border: '1px solid var(--oro-oscuro)', padding: '0.5rem', background: 'var(--sup-alta)' }}
              value={iniciado}
              onChange={e => setIniciado(e.target.value)}
            />
          </div>
          <div className="campo">
            <label className="campo__etiqueta">Fin</label>
            <input
              type="datetime-local"
              className="campo__entrada"
              style={{ border: '1px solid var(--oro-oscuro)', padding: '0.5rem', background: 'var(--sup-alta)' }}
              value={finalizado}
              onChange={e => setFinalizado(e.target.value)}
            />
          </div>
          <div className="campo">
            <label className="campo__etiqueta">Nota</label>
            <textarea
              className="campo__entrada campo__entrada--textarea"
              rows={3}
              value={nota}
              onChange={e => setNota(e.target.value)}
              placeholder="Nota opcional…"
            />
          </div>
          
          <div className="campo timer__file-upload" style={{ marginBottom: 'var(--espacio-sm)' }}>
              <label 
                className="campo__entrada" 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem', 
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  color: capturaFile ? 'var(--texto-principal)' : 'var(--texto-secundario)',
                  marginBottom: (capturaFile || sesion.captura_filename) ? '0.5rem' : '0'
                }}
              >
                <IconCamera />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {capturaFile ? capturaFile.name : (sesion.captura_filename ? 'Sustituir captura actual...' : 'Adjuntar captura de lectura...')}
                </span>
                <input 
                  type="file" 
                  accept="image/*"
                  style={{ display: 'none' }} 
                  onChange={e => {
                    if (e.target.files && e.target.files[0]) {
                      setCapturaFile(e.target.files[0])
                    }
                  }}
                />
              </label>

              {(capturaFile || sesion.captura_filename) && (
                <div style={{ textAlign: 'center', border: '1px solid var(--oro-oscuro)', padding: '0.5rem', background: 'var(--fondo-oscuro)', borderRadius: '4px' }}>
                  <img 
                    src={capturaFile ? URL.createObjectURL(capturaFile) : getCapturaURL(sesion.captura_filename)} 
                    alt="Miniatura de lectura" 
                    style={{ maxHeight: '120px', maxWidth: '100%', objectFit: 'contain', borderRadius: '4px' }}
                  />
                </div>
              )}
            </div>

          {error && <p style={{ color: 'var(--texto-error)', fontSize: '0.85rem' }}>✕ {error}</p>}
        </div>
        <div className="modal-pie" style={{ display: 'flex', gap: '0.8rem', justifyContent: 'flex-end' }}>
          <button className="btn btn-secundario" onClick={onCerrar}>Cancelar</button>
          <button className="btn btn-primario" onClick={guardar} disabled={guardando}>
            {guardando ? '...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  )
}
