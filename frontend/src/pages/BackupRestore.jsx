import { useState } from 'react'
import Header from '../components/Header.jsx'
import { API } from '../services/api.js'

export default function BackupRestore() {
  const [loading, setLoading] = useState(false)
  const [mensaje, setMensaje] = useState(null)
  const [error, setError] = useState(null)
  const [file, setFile] = useState(null)

  const handleExport = async () => {
    setLoading(true);
    setError(null);
    setMensaje(null);
    try {
      await API.descargarBackup();
      setMensaje("Descarga de 'bookish_backup.zip' completada con éxito.");
    } catch (err) {
      setError(err.message || "Error al descargar el backup.");
    } finally {
      setLoading(false);
      setTimeout(() => setMensaje(null), 5000);
    }
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  }

  const handleImport = async () => {
    if (!file) {
      setError("Por favor, selecciona un archivo .zip para importar.");
      return;
    }

    if (!window.confirm("⚠️ ADVERTENCIA: Esta acción sobrescribirá TODA tu biblioteca actual. ¿Estás absolutamente seguro de querer proceder?")) {
      return;
    }

    setLoading(true);
    setError(null);
    setMensaje(null);

    try {
      const res = await API.importarBackup(file);
      setMensaje(res.mensaje || "Backup restaurado exitosamente. Por favor, recarga la aplicación.");
      setFile(null);
      // document.getElementById('backup-upload').value = null; // optional reset
    } catch (err) {
      setError(err.message || "Error al restaurar el backup.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header />
      <main className="pagina">
        <div className="reportes-page animar-entrada">
          <div className="timers-page__header">
            <h1 className="timers-page__titulo">Respaldo y Restauración</h1>
            <p className="timers-page__subtitulo">Gestiona los datos de tu biblioteca Bookish</p>
          </div>

          <section style={{ maxWidth: '800px', margin: '4rem auto 0', display: 'flex', flexDirection: 'column', gap: '3rem' }}>
            
            {mensaje && (
              <div style={{ padding: '1rem', background: 'var(--verde-oscuro, rgba(0,255,0,0.1))', border: '1px solid var(--verde, green)', color: 'white', borderRadius: '4px', textAlign: 'center' }}>
                {mensaje}
              </div>
            )}

            {error && (
              <div style={{ padding: '1rem', background: 'rgba(255,0,0,0.1)', border: '1px solid red', color: 'white', borderRadius: '4px', textAlign: 'center' }}>
                {error}
              </div>
            )}

            <div className="seccion-bloque" style={{ padding: '2rem', border: '1px solid var(--oro-oscuro)', background: 'var(--sup-media)', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '2rem', color: 'var(--oro-primario)' }}>cloud_download</span>
                <h2 className="seccion-titulo" style={{ margin: 0 }}>Exportar Biblioteca</h2>
              </div>
              <p style={{ color: 'var(--texto-tenue)', marginBottom: '2rem' }}>
                Descarga un archivo ZIP con toda tu base de datos y las imágenes (portadas y capturas). Usa esto para tener una copia de seguridad segura de todo tu historial de lectura.
              </p>
              <button 
                className="btn-primario" 
                onClick={handleExport}
                disabled={loading}
                style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 1.25rem', alignSelf: 'flex-start' }}
              >
                <span className="material-symbols-outlined nav-icon" style={{ fontSize: '1.25rem' }}>download</span>
                Descargar Backup
              </button>
            </div>

            <div className="seccion-bloque" style={{ padding: '2rem', border: '1px solid var(--oro-oscuro)', background: 'var(--sup-media)', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '2rem', color: 'var(--oro-primario)' }}>cloud_upload</span>
                <h2 className="seccion-titulo" style={{ margin: 0 }}>Importar / Restaurar</h2>
              </div>
              <p style={{ color: 'var(--texto-tenue)', marginBottom: '1rem' }}>
                Si cambiaste de computadora o tienes una copia de seguridad previa, puedes restaurarla aquí. Asegúrate de seleccionar un archivo ZIP generado por la función de exportación.
              </p>
              <div style={{ margin: '1rem 0', padding: '1rem', background: 'rgba(255, 50, 50, 0.1)', borderLeft: '4px solid #ff4444', borderRadius: '4px' }}>
                <p style={{ margin: 0, color: 'var(--blanco)', fontSize: '0.9rem' }}>
                  <strong>Aviso Importante:</strong> Al restaurar un backup, tu biblioteca actual será eliminada y reemplazada completamente por la del archivo ZIP.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem' }}>
                <label 
                  htmlFor="backup-upload"
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '1rem', 
                    background: 'var(--sup-alta)', 
                    padding: '0.8rem 1.25rem', 
                    borderRadius: '4px', 
                    border: '1px dashed var(--dorado)', 
                    cursor: 'pointer',
                    width: 'fit-content',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'var(--sup-alta)'}
                >
                  <span className="material-symbols-outlined" style={{ color: 'var(--dorado)', fontSize: '1.5rem' }}>
                    {file ? 'task' : 'upload_file'}
                  </span>
                  <span style={{ color: file ? 'var(--blanco)' : 'var(--texto-tenue)', fontSize: '0.95rem', fontFamily: 'var(--font-cuerpo)' }}>
                    {file ? file.name : "Haz clic para buscar tu archivo ZIP"}
                  </span>
                </label>
                <input 
                  type="file" 
                  accept=".zip"
                  onChange={handleFileChange}
                  id="backup-upload"
                  style={{ display: 'none' }}
                />
                <button 
                  className="btn-primario" 
                  onClick={handleImport}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 1.25rem', alignSelf: 'flex-start' }}
                >
                  <span className="material-symbols-outlined nav-icon" style={{ fontSize: '1.25rem' }}>upload</span>
                  {loading ? 'Restaurando...' : 'Restaurar Biblioteca'}
                </button>
              </div>
            </div>

          </section>
        </div>
      </main>
    </>
  )
}
