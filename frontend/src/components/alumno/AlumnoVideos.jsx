import React from 'react';

export default function AlumnoVideos({
  gruposVideos,
  loading,
  expandedVideoCat,
  setExpandedVideoCat
}) {
  return (
    <section className="card module-card">
      <div className="module-head">
        <div>
          <span className="eyebrow">Material complementario</span>
          <h3 className="card-title">Videos educativos</h3>
        </div>
      </div>

      {loading ? (
        <div className="skeleton-list">
          <span></span>
          <span></span>
        </div>
      ) : (gruposVideos.length ? (
        <div className="video-groups">
          {gruposVideos.map(([categoria, items]) => {
            const open = !!expandedVideoCat[categoria];
            return (
              <article className="video-group" key={categoria}>
                <div className="video-group-head">
                  <div>
                    <h4>{categoria}</h4>
                    <p>{items.length} videos disponibles</p>
                  </div>
                  <button
                    className="btn btn-primary"
                    onClick={() => setExpandedVideoCat(s => ({ ...s, [categoria]: !open }))}
                  >
                    {open ? 'Esconder' : 'Acceder'}
                  </button>
                </div>

                {open && (
                  <div className="video-list">
                    {items.map(video => (
                      <div className="video-item" key={`${video.chatbotId}-${video.nombre}`}>
                        <h5>{video.nombre}</h5>
                        <p>{video.chatbotNombre}</p>
                        <div className="video-frame">
                          <iframe
                            src={`https://www.youtube.com/embed/${video.youtubeId}`}
                            title={video.nombre}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">
          <strong>No tienes videos asignados aun.</strong>
          <span>El material audiovisual aparecera aqui cuando este disponible.</span>
        </div>
      ))}
    </section>
  );
}
