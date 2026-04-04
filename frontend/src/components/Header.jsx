import { Link, useLocation } from 'react-router-dom'
import { memo } from 'react'

function Header() {
  const location = useLocation();
  const isLanding = location.pathname === '/';

  return (
    <header className="landing-header">
      <Link to="/" className="landing-logo-link">
        <div className="landing-logo">
          BOOKISH — EL ARCHIVO NOIR
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
          REGISTRAR LIBRO
        </Link>
        <Link 
          to="/timers" 
          className={`nav-link ${location.pathname === '/timers' ? 'active' : ''}`}
        >
          SESIONES
        </Link>
        <a href="/#unete" className="nav-link">
          ÚNETE AL ARCHIVO
        </a>
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
