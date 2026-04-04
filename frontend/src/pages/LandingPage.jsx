import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import './LandingPage.css';

export default function LandingPage() {
  return (
    <div className="landing-body">
      <Header />

      <main className="landing-main">
        {/* Hero Section */}
        <section className="hero-section">
          {/* Background Image with Tonal Mask */}
          <div className="hero-bg">
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuC_FQA7I3XM1t3j45ujGcmFUxXRsivdQcJ-X5cHQCLnmzCwTu_xWifN-eg3YJf0cKtpth3NQwnVnHwkRwZLmj-46Y-PT7A80LEAbYkugv-Ypv3YZiEeZ6kDS39xP_7dTltWeXbdowTV31p1-lXb57piYH15waw4s9RpeRNOtN-JdaclDnAR7qM9Gm6T-kx7zBNd5Jg8fa0WtQsXTUACKm0r_Hb1rbbTipv2RhJIbpWgMOZ9XBAAodEEkRKDaKTnuamQSlzsLuRA6paC" 
              alt="Vintage Art Deco Library" 
              className="hero-img" 
            />
            <div className="mask-bottom"></div>
            <div className="mask-sides"></div>
          </div>
          
          {/* Content Container */}
          <div className="hero-content">
            <div className="hero-eyebrow">ESTABLECIDO MCMXXIV</div>
            <h1 className="hero-title">
              BOOKISH <br/>
              <span className="hero-subtitle">EL ARCHIVO NOIR</span>
            </h1>
            <div className="hero-divider"></div>
            <p className="hero-text">
              "Tu historial de lectura, meticulosamente archivado."
            </p>
            <div className="hero-buttons">
              <Link to="/biblioteca" className="btn-landing primary">
                la biblioteca
              </Link>
              <Link to="/agregar" className="btn-landing secondary">
                Registrar Libro
              </Link>
            </div>
          </div>

          {/* Geometric Ornaments */}
          <div className="hero-ornaments">
            <span className="ornament-small">◆</span>
            <span className="ornament-large">◈</span>
            <span className="ornament-small">◆</span>
          </div>
        </section>

        {/* Feature Section */}
        <section id="caracteristicas" className="features-section">
          <div className="features-grid">
            {/* Feature 1: The Core */}
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <span className="feature-icon">◆</span>
              </div>
              <h3 className="feature-title">El Núcleo</h3>
              <div className="feature-divider"></div>
              <p className="feature-text">
                Rastrea títulos, autores y calificaciones con precisión arquitectónica. Cada volumen registrado en un relicario digital permanente.
              </p>
            </div>
            
            {/* Feature 2: Visual Intelligence */}
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <span className="feature-icon">◈</span>
              </div>
              <h3 className="feature-title">Inteligencia Visual</h3>
              <div className="feature-divider"></div>
              <p className="feature-text">
                Próximamente. Análisis profundo de tus hábitos de lectura y expansión de tus horizontes a través de visualización geométrica.
              </p>
            </div>
            
            {/* Feature 3: The Map of Worlds */}
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                  <span className="feature-icon">◉</span>
              </div>
              <h3 className="feature-title">El Mapa de Mundos</h3>
              <div className="feature-divider"></div>
              <p className="feature-text">
                Próximamente. Mapas interactivos de lugares ficticios. Traza tu viaje por la Tierra Media o las calles victorianas de Londres.
              </p>
            </div>
          </div>
        </section>

        {/* Aesthetic Divider */}
        <section className="aesthetic-divider">
          <div className="aesthetic-content">
            <div className="line hidden-mobile"></div>
            <div className="aesthetic-text">El Guardián de los Ecos</div>
            <div className="line hidden-mobile"></div>
          </div>
        </section>

        {/* Bento Showcase Section */}
        <section className="bento-section">
          <div className="bento-grid">
            <div className="bento-item bento-large group">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuALhHWfZz3G4GtvBLw34WFsNssjY4SO7cY5ms2QdXdkcyY8CnCVsfQLhF_49mNlH4IFDsKsvWoW0RI1Ht9fpukS89TUGscvYYboWqSgHqhiH9XuPdlZYoksa7HbocffrcleYJVh6X3vT_fe5ezL6dBB21V4Rj9wRG539e3FDA_Dm9nnXvJCDkYYtswB5o4pHYxOb0r3jcfeJzi76wYPbnyaKq4cjScMVgeX7ybHcKC0RY7mXm-Kgt-OBRJrS5KBMsvUad3OliFtNl-f" 
                alt="Leatherbound Collection" 
                className="bento-img" 
              />
              <div className="bento-large-content">
                <span className="bento-eyebrow">MCMXXIV — MCMXL</span>
                <h4 className="bento-title">Los Volúmenes de la Edad Dorada</h4>
                <p className="bento-text">Una restauración digital de las ediciones más raras jamás catalogadas dentro del Archivo Noir.</p>
              </div>
            </div>
            
            <div className="bento-item bento-wide">
              <div className="bento-wide-content">
                <h4 className="bento-title-small">Perspectivas Bibliométricas</h4>
                <div className="bento-chart">
                  <div className="chart-bar h-40"></div>
                  <div className="chart-bar alt h-70"></div>
                  <div className="chart-bar h-90"></div>
                  <div className="chart-bar alt-dark h-50"></div>
                  <div className="chart-bar h-80"></div>
                </div>
                <p className="bento-italic">Próximamente. Tus patrones son tan únicos como la tinta sobre la página.</p>
              </div>
              <div className="bento-corner-decor"></div>
            </div>
            
            <div className="bento-item bento-small stat-box">
              <span className="material-symbols-outlined stat-icon" data-icon="auto_stories">auto_stories</span>
              <div className="stat-label">Páginas Leídas</div>
              <div className="stat-value">14,802</div>
            </div>
            
            <div className="bento-item bento-small stat-box alt-bg">
              <span className="material-symbols-outlined stat-icon" data-icon="explore">explore</span>
              <div className="stat-label">Mundos Explorados</div>
              <div className="stat-value">42</div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="landing-footer flex-col md-flex-row">
        <div className="footer-copyright">
          © MCMXXIV EL ARCHIVO NOIR. TODOS LOS DERECHOS RESERVADOS.
        </div>
        <div className="footer-links">
          <a href="#">PRIVACIDAD</a>
          <a href="#">TÉRMINOS</a>
          <Link to="/biblioteca">LA BITÁCORA</Link>
        </div>
        <div className="footer-ornaments">
          <span>◆</span>
          <span>◈</span>
          <span>◆</span>
        </div>
      </footer>
    </div>
  );
}
