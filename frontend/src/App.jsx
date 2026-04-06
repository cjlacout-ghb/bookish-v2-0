import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Biblioteca from './pages/Biblioteca.jsx'
import DetalleLibro from './pages/DetalleLibro.jsx'
import FormLibro from './pages/FormLibro.jsx'
import LandingPage from './pages/LandingPage.jsx'
import Timers from './pages/Timers.jsx'
import Reportes from './pages/Reportes.jsx'
import BackButton from './components/BackButton.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <BackButton />
      <Routes>
        <Route path="/"                   element={<LandingPage />} />
        <Route path="/biblioteca"         element={<Biblioteca />} />
        <Route path="/libro/:id"          element={<DetalleLibro />} />
        <Route path="/agregar"            element={<FormLibro />} />
        <Route path="/libro/:id/editar"   element={<FormLibro />} />
        <Route path="/sesiones"           element={<Timers />} />
        <Route path="/reportes"           element={<Reportes />} />
      </Routes>
    </BrowserRouter>
  )
}
