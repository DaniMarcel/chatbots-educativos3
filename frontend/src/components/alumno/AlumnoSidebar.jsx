import React from 'react';

const Icon = ({ children }) => (
  <svg
    className="sidebar-svg"
    width="17"
    height="17"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
);

const UserIcon = () => (
  <Icon>
    <path d="M20 21a8 8 0 0 0-16 0" />
    <circle cx="12" cy="8" r="4" />
  </Icon>
);

const ChatIcon = () => (
  <Icon>
    <path d="M21 12a8 8 0 0 1-8 8H6l-3 3v-7a8 8 0 1 1 18-4Z" />
    <path d="M8 12h8" />
    <path d="M8 8h5" />
  </Icon>
);

const VideoIcon = () => (
  <Icon>
    <path d="M4 6h11a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H4z" />
    <path d="m18 10 4-2v8l-4-2" />
  </Icon>
);

const BotIcon = () => (
  <Icon>
    <rect x="5" y="7" width="14" height="12" rx="3" />
    <path d="M12 3v4" />
    <path d="M9 12h.01" />
    <path d="M15 12h.01" />
    <path d="M9 16h6" />
  </Icon>
);

export default function AlumnoSidebar({
  usuario,
  seccion,
  setSeccion,
  isSidebarOpen,
  setIsSidebarOpen,
  cerrarSesion
}) {
  const initials = `${usuario?.nombre?.[0] || ''}${usuario?.apellido?.[0] || ''}`.toUpperCase() || 'AL';

  const selectSection = (nextSection) => {
    setSeccion(nextSection);
    setIsSidebarOpen(false);
  };

  return (
    <>
      <div
        className={`al-overlay ${isSidebarOpen ? 'active' : ''}`}
        onClick={() => setIsSidebarOpen(false)}
      />

      <aside className={`al-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <button
          className="al-sidebar-close"
          onClick={() => setIsSidebarOpen(false)}
          aria-label="Cerrar menu"
        >
          x
        </button>

        <div className="brand">
          <div className="logo"><BotIcon /></div>
          <div className="brand-text">
            <span className="brand-top">Campus</span>
            <span className="brand-bottom">Chatbots</span>
          </div>
        </div>

        <div className="user-card">
          <span className="avatar-initials">{initials}</span>
          <div className="user-info">
            <div className="user-name">{usuario?.nombre} {usuario?.apellido}</div>
            <div className="user-doc">{usuario?.tipo_documento} {usuario?.numero_documento}</div>
          </div>
        </div>

        <nav className="al-nav">
          <button
            className={`nav-item ${seccion === 'perfil' ? 'active' : ''}`}
            onClick={() => selectSection('perfil')}
          >
            <span className="nav-ico"><UserIcon /></span>
            <span>Perfil</span>
          </button>

          <button
            className={`nav-item ${seccion === 'chatbots' ? 'active' : ''}`}
            onClick={() => selectSection('chatbots')}
          >
            <span className="nav-ico"><ChatIcon /></span>
            <span>Chatbots</span>
          </button>

          <button
            className={`nav-item ${seccion === 'otros' ? 'active' : ''}`}
            onClick={() => selectSection('otros')}
          >
            <span className="nav-ico"><VideoIcon /></span>
            <span>Videos</span>
          </button>
        </nav>

        <button className="btn btn-logout" onClick={cerrarSesion}>
          Cerrar sesión
        </button>
      </aside>
    </>
  );
}
