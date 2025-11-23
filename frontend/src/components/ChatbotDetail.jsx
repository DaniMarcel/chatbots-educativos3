import React, { useState } from 'react';

function getYouTubeID(url) {
    if (!url) return '';
    const arr = url.split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
    return (arr[2] !== undefined) ? arr[2].split(/[^0-9a-z_-]/i)[0] : arr[0];
}

export default function ChatbotDetail({ chatbot, onBack }) {
    const [expandedVideo, setExpandedVideo] = useState(null);

    if (!chatbot) return null;

    return (
        <div className="ac-detail">
            <button className="btn btn-secondary mb-4" onClick={onBack}>
                ← Volver
            </button>

            <h2 className="ac-detail-title">{chatbot.nombre}</h2>

            {/* Iframe del Chatbot */}
            <div className="ac-iframe-container">
                <iframe
                    title={chatbot.nombre}
                    src={chatbot.iframeUrl}
                    width="100%"
                    height="600px"
                    frameBorder="0"
                    allow="clipboard-write; microphone; camera"
                    sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                />
            </div>

            {/* Videos relacionados */}
            {chatbot.videos && chatbot.videos.length > 0 && (
                <div className="ac-videos-section">
                    <h3>Videos Relacionados</h3>
                    <div className="ac-videos-grid">
                        {chatbot.videos.map((video, idx) => (
                            <div key={idx} className="ac-video-card">
                                <h4>{video.nombre}</h4>
                                <div className="ac-video-embed">
                                    <iframe
                                        src={`https://www.youtube.com/embed/${getYouTubeID(video.url)}`}
                                        title={video.nombre}
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
