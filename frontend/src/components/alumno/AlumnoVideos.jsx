import React from 'react';

export default function AlumnoVideos({
    gruposVideos,
    loading,
    expandedVideoCat,
    setExpandedVideoCat
}) {
    return (
        <section className="card">
            <h3 className="card-title">Videos Educativos</h3>

            {loading ? (
                <p className="empty">Cargando videos…</p>
            ) : (gruposVideos.length ? (
                <div className="cb-groups list">
                    {gruposVideos.map(([categoria, items]) => {
                        const open = !!expandedVideoCat[categoria];
                        return (
                            <div className="cb-group" key={categoria} style={{ marginBottom: 24 }}>
                                <div className="cb-group-title">
                                    <strong>{categoria}</strong> <span className="chip">{items.length}</span>
                                </div>
                                {!open && (
                                    <button className="btn btn-primary" onClick={() => setExpandedVideoCat(s => ({ ...s, [categoria]: true }))}>
                                        Acceder
                                    </button>
                                )}
                                {open && (
                                    <>
                                        <button className="btn btn-secondary" onClick={() => setExpandedVideoCat(s => ({ ...s, [categoria]: false }))}>
                                            Esconder
                                        </button>
                                        {items.map(video => (
                                            <div key={`${video.chatbotId}-${video.nombre}`} style={{ marginTop: 16 }}>
                                                <h4 style={{ marginBottom: 8 }}>{video.nombre} (de {video.chatbotNombre})</h4>
                                                <div style={{ position: 'relative', paddingTop: '56.25%' }}>
                                                    <iframe
                                                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                                                        src={`https://www.youtube.com/embed/${video.youtubeId}`}
                                                        title={video.nombre}
                                                        frameBorder="0"
                                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                        allowFullScreen
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <p className="empty">No tienes videos asignados aún.</p>
            ))}
        </section>
    );
}
