import React from 'react';

export default function ChatbotList({
    bots,
    loading,
    onSelect,
    onEdit,
    onDelete,
    rol
}) {
    if (loading) return <div className="ac-loading">Cargando chatbots...</div>;

    if (bots.length === 0) {
        return <div className="ac-empty">No hay chatbots en esta categoría.</div>;
    }

    return (
        <div className="ac-grid">
            {bots.map((bot) => (
                <div key={bot._id} className="ac-card">
                    <div className="ac-card-icon">🤖</div>
                    <h3 className="ac-card-title">{bot.nombre}</h3>
                    <p className="ac-card-desc">{bot.descripcion || "Sin descripción"}</p>

                    <div className="ac-card-actions">
                        <button
                            className="btn btn-primary btn-sm"
                            onClick={() => onSelect(bot)}
                        >
                            Acceder
                        </button>

                        {['admin', 'profesor'].includes(rol) && (
                            <>
                                <button
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => onEdit(bot)}
                                >
                                    Editar
                                </button>
                                <button
                                    className="btn btn-danger btn-sm"
                                    onClick={() => onDelete(bot._id)}
                                >
                                    Eliminar
                                </button>
                            </>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
