import { useState } from 'react';
import '../styles/PanelAlumno.css';
import useAlumno from '../hooks/useAlumno';
import AlumnoSidebar from '../components/alumno/AlumnoSidebar';
import AlumnoProfile from '../components/alumno/AlumnoProfile';
import AlumnoChatbots from '../components/alumno/AlumnoChatbots';
import AlumnoVideos from '../components/alumno/AlumnoVideos';

export default function PanelAlumno() {
  const [seccion, setSeccion] = useState('perfil');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const {
    usuario,
    loading,
    lastLoadedAt,
    chatbots,
    gruposVideos,
    riesgo,
    estadoCuentaTexto,
    riskClass,
    deudaLabel,
    activeIframeSrc,
    updateActiveIframeSrc,
    expandedVideoCat,
    setExpandedVideoCat,
    cerrarSesion
  } = useAlumno();

  return (
    <div className="al-theme">
      <div className={`al-layout ${isSidebarOpen ? 'sidebar-open' : ''}`}>

        <AlumnoSidebar
          usuario={usuario}
          seccion={seccion}
          setSeccion={setSeccion}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          cerrarSesion={cerrarSesion}
        />

        {/* Main */}
        <div className="al-main-container">
          <header className="al-header">
            {/* Botón de menú para móviles */}
            <button className="al-menu-toggle" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
              <span></span>
              <span></span>
              <span></span>
            </button>
            <div className="titles">
              <h1>Panel del Alumno</h1>
              <p className="subtitle">Tu información personal, académica y accesos.</p>
            </div>
          </header>

          <main className="al-main">
            {seccion === 'perfil' && (
              <AlumnoProfile
                usuario={usuario}
                estadoCuentaTexto={estadoCuentaTexto}
                riskClass={riskClass}
                deudaLabel={deudaLabel}
                riesgo={riesgo}
              />
            )}

            {seccion === 'chatbots' && (
              <AlumnoChatbots
                chatbots={chatbots}
                loading={loading}
                lastLoadedAt={lastLoadedAt}
                activeIframeSrc={activeIframeSrc}
                updateActiveIframeSrc={updateActiveIframeSrc}
                setExpandedVideoCat={setExpandedVideoCat}
              />
            )}

            {seccion === 'otros' && (
              <AlumnoVideos
                gruposVideos={gruposVideos}
                loading={loading}
                expandedVideoCat={expandedVideoCat}
                setExpandedVideoCat={setExpandedVideoCat}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}