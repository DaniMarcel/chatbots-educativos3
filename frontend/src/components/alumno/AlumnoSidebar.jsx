import React from 'react';

export default function AlumnoSidebar({
    usuario,
    seccion,
    setSeccion,
    isSidebarOpen,
    setIsSidebarOpen,
    cerrarSesion
}) {
    return (
        <>
            <div className={`al-overlay ${isSidebarOpen ? 'active' : ''}`} onClick={() => setIsSidebarOpen(false)}></div>
            <aside className={`al-sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <button className="al-sidebar-close" onClick={() => setIsSidebarOpen(false)}>&times;</button>
                <div className="brand">
                    <div className="logo">🤖</div>
                    <div className="brand-text">
                        <span className="brand-top">Campus</span>
                        <span className="brand-bottom">Chatbots</span>
                    </div>
                </div>

                <div className="user-card">
                    <span className="avatar-emoji">👨‍🎓</span>
                    <div className="user-info">
                        <div className="user-name">{usuario?.nombre} {usuario?.apellido}</div>
                        <div className="user-doc">{usuario?.tipo_documento} {usuario?.numero_documento}</div>
                    </div>
                </div>

                <nav className="al-nav">
                    <button className={`nav-item ${seccion === 'perfil' ? 'active' : ''}`} onClick={() => setSeccion('perfil')}>
                        <span className="nav-ico">👤</span><span>Perfil</span>
                    </button>
                    <button className={`nav-item ${seccion === 'chatbots' ? 'active' : ''}`} onClick={() => setSeccion('chatbots')}>
                        <span className="nav-ico">💬</span><span>Chatbots</span>
                    </button>
                    <button className={`nav-item ${seccion === 'otros' ? 'active' : ''}`} onClick={() => setSeccion('otros')}>
                        <span className="nav-ico">📽️</span><span>Videos</span>
                    </button>
                </nav>

                <button className="btn btn-logout" onClick={cerrarSesion}>Cerrar sesión</button>
            </aside>
        </>
    );
}
