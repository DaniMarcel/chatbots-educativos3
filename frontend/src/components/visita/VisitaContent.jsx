import React from 'react';
import HeroSection from '../HeroSection';

export default function VisitaContent({ seccion, config }) {
    if (seccion === 'inicio') {
        return (
            <>
                <section className="card">
                    <h3 className="card-title">{config.welcome.title}</h3>
                    <p>{config.welcome.text}</p>
                </section>
                <HeroSection />
            </>
        );
    }

    if (seccion === 'videos') {
        return (
            <section className="card">
                <h3 className="card-title">Videos Educativos</h3>
                {config.videos.length > 0 ? (
                    config.videos.map(video => (
                        <div key={video._id} className="video-container">
                            <h4>{video.title}</h4>
                            <iframe
                                src={video.videoUrl}
                                title={video.title}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        </div>
                    ))
                ) : (
                    <p>No hay videos disponibles en este momento.</p>
                )}
            </section>
        );
    }

    // Handle chatbot sections
    const chatbot = config.chatbots.find(cb => cb._id === seccion);
    if (chatbot) {
        return (
            <section className="card">
                <h3 className="card-title">{chatbot.title}</h3>
                <div className="iframe-wrap">
                    <iframe
                        src={chatbot.iframeUrl}
                        title={chatbot.title}
                        frameBorder="0"
                        allow="clipboard-write; microphone; camera; geolocation; fullscreen; autoplay; encrypted-media"
                        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-storage-access-by-user-activation"
                        referrerPolicy="no-referrer-when-downgrade"
                        loading="lazy"
                        style={{ width: '100%', height: '600px', border: 'none' }}
                    />
                </div>
            </section>
        );
    }

    return null;
}
