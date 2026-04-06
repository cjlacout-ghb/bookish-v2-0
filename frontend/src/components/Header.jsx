import { Link, useLocation } from 'react-router-dom'
import { memo } from 'react'

function Header() {
  const location = useLocation();
  const isLanding = location.pathname === '/';

  return (
    <header className="landing-header">
      <Link to="/" className="landing-logo-link">
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
        <span className="material-symbols-outlined nav-icon" data-icon="menu_book">
          menu_book
        </span>
      </div>
    </header>
  )
}

export default memo(Header)
