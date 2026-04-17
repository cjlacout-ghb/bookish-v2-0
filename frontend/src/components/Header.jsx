import { Link, useLocation } from 'react-router-dom'
import { memo } from 'react'

function Header() {
  const location = useLocation()

  return (
    <header className="landing-header">
      <Link 
        to="/" 
        className="landing-logo-link"
        onClick={() => {
          if (location.pathname === '/') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
      >
        <div className="landing-logo">
          BOOKISH
        </div>
      </Link>
      
      <nav className="landing-nav hidden-mobile">
        <Link 
          to="/biblioteca" 
          className={`nav-link ${location.pathname === '/biblioteca' ? 'active' : ''}`}
        >
          LA BIBLIOTECA
        </Link>
        <Link 
          to="/agregar" 
          className={`nav-link ${location.pathname === '/agregar' ? 'active' : ''}`}
        >
          AGREGAR LIBRO
        </Link>
        <Link 
          to="/sesiones" 
          className={`nav-link ${location.pathname === '/sesiones' ? 'active' : ''}`}
        >
          SESIONES
        </Link>
        <Link 
          to="/reportes" 
          className={`nav-link ${location.pathname === '/reportes' ? 'active' : ''}`}
        >
          REPORTES
        </Link>

      </nav>

      <div className="landing-actions">
        <Link to="/backup" title="Importar / Exportar Biblioteca" style={{ color: 'inherit', textDecoration: 'none', marginRight: '1rem' }}>
          <span className="material-symbols-outlined nav-icon" data-icon="cloud">
            cloud
          </span>
        </Link>
        <Link to="/guia" title="Guía de Usuario" style={{ color: 'inherit', textDecoration: 'none' }}>
          <span className="material-symbols-outlined nav-icon" data-icon="menu_book">
            menu_book
          </span>
        </Link>
      </div>
    </header>
  )
}

export default memo(Header)
