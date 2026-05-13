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
    <section className="card module-card">
      <div className="card-head module-head">
        <div>
          <span className="eyebrow">Accesos disponibles</span>
          <h3 className="card-title">Chatbots asignados</h3>
        </div>
        {lastLoadedAt && <span className="hint small">Actualizado {lastLoadedAt.toLocaleTimeString()}</span>}
      </div>

      {loading ? (
        <div className="skeleton-list">
          <span></span>
          <span></span>
          <span></span>
        </div>
      ) : (chatbots.length ? (
        <div className="chatbot-list">
          {chatbots.map((chatbot) => {
            const open = activeIframeSrc === chatbot.embedUrl;
            return (
              <article className={`chatbot-row ${open ? 'is-open' : ''}`} key={chatbot._id}>
                <div className="chatbot-row-main">
                  <div className="chatbot-mark">AI</div>
                  <div className="chatbot-copy">
                    <h4>{chatbot.nombre}</h4>
                    <p>{chatbot.categoria}</p>
                  </div>
                </div>

                <button
                  className="btn btn-primary chatbot-action"
                  onClick={() => {
                    const newSrc = open ? null : chatbot.embedUrl;
                    updateActiveIframeSrc(newSrc);
                    if (!newSrc) setExpandedVideoCat({});
                  }}
                >
                  {open ? 'Cerrar' : 'Acceder'}
                </button>

                {open && (
                  <div className="chatbot-frame">
                    <iframe
                      title={chatbot.nombre}
                      src={chatbot.embedUrl}
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      allow="clipboard-write; microphone; camera"
                      sandbox="allow-downloads allow-scripts allow-same-origin allow-popups allow-forms"
                      key={chatbot.embedUrl}
                    />
                  </div>
                )}
              </article>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">
          <strong>No tienes chatbots asignados aun.</strong>
          <span>Cuando tu profesor habilite un modulo, aparecera en esta seccion.</span>
        </div>
      ))}
    </section>
  );
}
