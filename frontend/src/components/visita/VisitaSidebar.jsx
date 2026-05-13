import React from 'react';

const Icon = ({ children, className = '' }) => (
  <svg
    className={`sidebar-svg ${className}`}
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

const HomeIcon = () => (
  <Icon>
    <path d="M3 10.5 12 3l9 7.5" />
    <path d="M5 10v10h14V10" />
    <path d="M9 20v-6h6v6" />
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

const WhatsAppIcon = () => (
  <svg
    className="sidebar-svg whatsapp-svg"
    width="17"
    height="17"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M20.52 3.48A11.83 11.83 0 0 0 12.1 0C5.56 0 .23 5.32.23 11.87c0 2.09.55 4.14 1.6 5.94L0 24l6.35-1.66a11.9 11.9 0 0 0 5.75 1.46h.01c6.55 0 11.88-5.32 11.88-11.87 0-3.17-1.23-6.15-3.47-8.45ZM12.11 21.8a9.87 9.87 0 0 1-5.03-1.38l-.36-.22-3.77.99 1.01-3.67-.24-.38a9.82 9.82 0 0 1-1.5-5.27c0-5.45 4.44-9.88 9.9-9.88 2.64 0 5.13 1.03 7 2.9a9.83 9.83 0 0 1 2.9 7.02c0 5.45-4.44 9.89-9.91 9.89Zm5.42-7.4c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.65-2.05-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.49 0 1.46 1.07 2.87 1.22 3.07.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.75-.72 2-1.41.25-.7.25-1.29.17-1.42-.07-.13-.27-.2-.57-.35Z" />
  </svg>
);

export default function VisitaSidebar({
  config,
  seccion,
  handleNavClick,
  isSidebarOpen,
  toggleSidebar,
  cerrarSesion
}) {
  return (
    <>
      <div className={`al-overlay ${isSidebarOpen ? 'active' : ''}`} onClick={toggleSidebar}></div>
      <aside className={`al-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <button className="al-sidebar-close" onClick={toggleSidebar} aria-label="Cerrar menu">x</button>

        <div className="brand">
          <div className="logo"><BotIcon /></div>
          <div className="brand-text">
            <span className="brand-top">Masoterapia</span>
            <span className="brand-bottom">Chatbots</span>
          </div>
        </div>

        <nav className="al-nav">
          <button className={`nav-item ${seccion === 'inicio' ? 'active' : ''}`} onClick={() => handleNavClick('inicio')}>
            <span className="nav-ico"><HomeIcon /></span>
            <span>Inicio</span>
          </button>

          <a href="https://wa.me/56226970116" target="_blank" rel="noopener noreferrer" className="nav-item">
            <span className="nav-ico"><WhatsAppIcon /></span>
            <span>WhatsApp</span>
          </a>

          {config?.chatbots?.map(chatbot => (
            <button key={chatbot._id} className={`nav-item ${seccion === chatbot._id ? 'active' : ''}`} onClick={() => handleNavClick(chatbot._id)}>
              <span className="nav-ico"><ChatIcon /></span>
              <span>{chatbot.title}</span>
            </button>
          ))}

          {config?.videos?.length > 0 && (
            <button className={`nav-item ${seccion === 'videos' ? 'active' : ''}`} onClick={() => handleNavClick('videos')}>
              <span className="nav-ico"><VideoIcon /></span>
              <span>Videos</span>
            </button>
          )}
        </nav>

        <button className="btn btn-logout" onClick={cerrarSesion}>Cerrar sesión</button>
      </aside>
    </>
  );
}
