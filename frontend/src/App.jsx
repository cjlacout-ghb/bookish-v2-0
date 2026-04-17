import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Biblioteca from './pages/Biblioteca.jsx'
import DetalleLibro from './pages/DetalleLibro.jsx'
import FormLibro from './pages/FormLibro.jsx'
import LandingPage from './pages/LandingPage.jsx'
import Sesiones from './pages/Timers.jsx'
import Reportes from './pages/Reportes.jsx'
import GuiaUsuario from './pages/GuiaUsuario.jsx'
import BackupRestore from './pages/BackupRestore.jsx'
import BackButton from './components/BackButton.jsx'

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <BackButton />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/biblioteca" element={<Biblioteca />} />
        <Route path="/libro/:id" element={<DetalleLibro />} />
        <Route path="/agregar" element={<FormLibro />} />
        <Route path="/libro/:id/editar" element={<FormLibro />} />
        <Route path="/sesiones" element={<Sesiones />} />
        <Route path="/reportes" element={<Reportes />} />
        <Route path="/guia" element={<GuiaUsuario />} />
        <Route path="/backup" element={<BackupRestore />} />
      </Routes>
    </Router>
  )
}
