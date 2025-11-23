import React, { useState, useEffect } from "react";
import "../styles/AccesoChatbots.css";
import useChatbots from "../hooks/useChatbots";
import ChatbotList from "../components/ChatbotList";
import ChatbotDetail from "../components/ChatbotDetail";
import EditChatbotModal from "./EditChatbotModal"; // Asumimos que este componente ya existe y funciona

// Helper para decodificar JWT (simplificado)
const parseJwt = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
};

export default function AccesoChatbots() {
  const token = localStorage.getItem("token");
  const [rol, setRol] = useState("");

  useEffect(() => {
    const usuario = token ? parseJwt(token) : null;
    setRol(usuario?.rol || "");
  }, [token]);

  const {
    cats,
    selCat,
    setSelCat,
    bots,
    loadingCats,
    loadingBots,
    crearChatbot,
    actualizarChatbot,
    eliminarChatbot,
    eliminarCategoria
  } = useChatbots();

  const [selectedBot, setSelectedBot] = useState(null); // Para ver detalle
  const [editingBot, setEditingBot] = useState(null);   // Para editar/crear
  const [isCreating, setIsCreating] = useState(false);

  // Handlers
  const handleSelectBot = (bot) => {
    setSelectedBot(bot);
  };

  const handleBack = () => {
    setSelectedBot(null);
  };

  const handleCreateClick = () => {
    setIsCreating(true);
    setEditingBot({
      nombre: "",
      descripcion: "",
      categoria: selCat || "",
      iframeUrl: "",
      videos: []
    });
  };

  const handleEditClick = (bot) => {
    setIsCreating(false);
    setEditingBot(bot);
  };

  const handleSaveBot = async (botData) => {
    let success = false;
    if (isCreating) {
      success = await crearChatbot(botData);
    } else {
      success = await actualizarChatbot(botData._id, botData);
    }

    if (success) {
      setEditingBot(null);
      setIsCreating(false);
    }
  };

  const handleDeleteBot = async (id) => {
    await eliminarChatbot(id);
    if (selectedBot && selectedBot._id === id) {
      setSelectedBot(null);
    }
  };

  // Render
  return (
    <div className="ac-container">
      <header className="ac-header">
        <h1>Acceso a Chatbots</h1>
        <p>Selecciona una categoría y explora los asistentes virtuales disponibles.</p>
      </header>

      {/* Si estamos viendo un detalle, mostramos solo el detalle */}
      {selectedBot ? (
        <ChatbotDetail chatbot={selectedBot} onBack={handleBack} />
      ) : (
        <div className="ac-layout">
          {/* Sidebar de Categorías */}
          <aside className="ac-sidebar">
            <div className="ac-cat-header">
              <h3>Categorías</h3>
            </div>

            {loadingCats ? (
              <div className="ac-loading-small">Cargando...</div>
            ) : (
              <ul className="ac-cat-list">
                {cats.map((c) => (
                  <li
                    key={c.nombre}
                    className={selCat === c.nombre ? "active" : ""}
                    onClick={() => setSelCat(c.nombre)}
                  >
                    {c.nombre} <span className="badge">{c.count}</span>
                    {['admin', 'profesor'].includes(rol) && (
                      <button
                        className="btn-icon-delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          eliminarCategoria(c.nombre);
                        }}
                        title="Eliminar categoría"
                      >
                        ×
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}

            {['admin', 'profesor'].includes(rol) && (
              <div className="ac-admin-panel">
                <button className="btn btn-success btn-block" onClick={handleCreateClick}>
                  + Nuevo Chatbot
                </button>
              </div>
            )}
          </aside>

          {/* Lista de Chatbots */}
          <main className="ac-main">
            <div className="ac-main-header">
              <h2>{selCat || "Selecciona una categoría"}</h2>
            </div>

            <ChatbotList
              bots={bots}
              loading={loadingBots}
              onSelect={handleSelectBot}
              onEdit={handleEditClick}
              onDelete={handleDeleteBot}
              rol={rol}
            />
          </main>
        </div>
      )}

      {/* Modal de Edición/Creación */}
      {editingBot && (
        <EditChatbotModal
          chatbot={editingBot}
          onClose={() => setEditingBot(null)}
          onSave={handleSaveBot}
          isNew={isCreating}
          categorias={cats.map(c => c.nombre)}
        />
      )}
    </div>
  );
}
