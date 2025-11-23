import React from 'react';
import '../styles/PanelAlumno.css';
import '../styles/HeroSection.css';
import useVisita from '../hooks/useVisita';
import VisitaSidebar from '../components/visita/VisitaSidebar';
import VisitaContent from '../components/visita/VisitaContent';

export default function BienvenidaVisita() {
  const {
    seccion,
    config,
    cargando,
    isSidebarOpen,
    error,
    toggleSidebar,
    handleNavClick,
    cerrarSesion
  } = useVisita();

  if (cargando || !config) {
    return (
      <div className="visit-loading">
        <div className="visit-spinner" />
        <p className="visit-loading-text">
          {error || "Cargando recursos... ⏳"}
        </p>
      </div>
    );
  }

  return (
    <div className="al-theme">
      <div className={`al-layout ${isSidebarOpen ? 'sidebar-open' : ''}`}>

        <VisitaSidebar
          config={config}
          seccion={seccion}
          handleNavClick={handleNavClick}
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
          cerrarSesion={cerrarSesion}
        />

        <main className="al-main">
          <header className="al-header">
            <button className="al-menu-toggle" onClick={toggleSidebar}>
              <span></span>
              <span></span>
              <span></span>
            </button>
            <div className="titles">
              <h1>Panel de Visita</h1>
              <p className="subtitle">Explora nuestros recursos educativos.</p>
            </div>
          </header>

          <VisitaContent seccion={seccion} config={config} />
        </main>
      </div>
    </div>
  );
}
