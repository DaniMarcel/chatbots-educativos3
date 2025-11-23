import React from 'react';

export default function AlumnoChatbots({
    chatbots,
    loading,
    lastLoadedAt,
    activeIframeSrc,
    updateActiveIframeSrc,
    setExpandedVideoCat
}) {
    return (
        <section className="card">
            <div className="card-head">
                <h3 className="card-title">Chatbots Asignados</h3>
                {lastLoadedAt && <span className="hint small">Actualizado: {lastLoadedAt.toLocaleTimeString()}</span>}
            </div>

            {loading ? (
                <p className="empty">Cargando chatbots…</p>
            ) : (chatbots.length ? (
                <div className="cb-groups list">
                    {chatbots.map((chatbot) => {
                        const open = activeIframeSrc === chatbot.embedUrl;
                        return (
                            <div className="cb-group" key={chatbot._id} style={{ marginBottom: 16 }}>
                                <div className="cb-group-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                                    <div>
                                        <strong>{chatbot.nombre}</strong>
                                        <div className="muted small" style={{ marginTop: 4 }}>
                                            {chatbot.categoria}
                                        </div>
                                    </div>
                                    <button className="btn btn-primary" onClick={() => {
                                        const newSrc = open ? null : chatbot.embedUrl;
                                        updateActiveIframeSrc(newSrc);
                                        if (!newSrc) {
                                            // Si cerramos el chatbot, reseteamos el estado de expansión de videos
                                            setExpandedVideoCat({});
                                        }
                                    }}>
                                        {open ? 'Cerrar' : 'Acceder'}
                                    </button>
                                </div>
                                {open && (
                                    <div style={{ marginTop: '16px', height: '800px', width: '100%' }}>
                                        <iframe
                                            title={chatbot.nombre}
                                            src={chatbot.embedUrl}
                                            width="100%"
                                            height="100%"
                                            frameBorder="0"
                                            allow="clipboard-write; microphone; camera"
                                            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                                            key={chatbot.embedUrl}
                                        />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <p className="empty">No tienes chatbots asignados aún.</p>
            ))}
        </section>
    );
}
