import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'https://chatbots-educativos3-vhfq.onrender.com/api';

const getAuthHeader = () => {
    const token = localStorage.getItem('token') || '';
    return { Authorization: `Bearer ${token}` };
};

const chatbotService = {
    // Obtener categorías (con conteo)
    getCategorias: async () => {
        // Primero intentamos el endpoint de categorías
        try {
            const response = await axios.get(`${API_BASE}/chatbots/categories`, { headers: getAuthHeader() });
            return response.data;
        } catch (error) {
            // Fallback: obtener todos los chatbots y calcular categorías manualmente (lógica legacy)
            console.warn("Endpoint /categories falló, calculando localmente", error);
            try {
                const response = await axios.get(`${API_BASE}/chatbots`, { headers: getAuthHeader() });
                const data = response.data || [];
                if (!Array.isArray(data)) {
                    return [];
                }
                const map = new Map();
                data.forEach(b => {
                    const c = b.categoria || "Sin categoría";
                    map.set(c, (map.get(c) || 0) + 1);
                });
                return Array.from(map.entries()).map(([nombre, count]) => ({ nombre, count }));
            } catch (err2) {
                console.error("chatbotService: fallback failed", err2);
                return [];
            }
        }
    },

    // Obtener chatbots por categoría
    getChatbots: async (categoria) => {
        const url = `${API_BASE}/chatbots?categoria=${encodeURIComponent(categoria)}`;
        const response = await axios.get(url, { headers: getAuthHeader() });
        return response.data;
    },

    // Crear nueva categoría (dummy endpoint si no existe en backend, o lógica de negocio)
    // En el código original solo se actualizaba el estado local hasta crear un chatbot en esa categoría.
    // Aquí asumiremos que la creación de categoría es implícita al crear un chatbot, 
    // pero si hay un endpoint específico lo usaríamos.

    // Crear chatbot
    crearChatbot: async (chatbotData) => {
        const response = await axios.post(`${API_BASE}/chatbots`, chatbotData, { headers: getAuthHeader() });
        return response.data;
    },

    // Actualizar chatbot
    actualizarChatbot: async (id, chatbotData) => {
        const response = await axios.patch(`${API_BASE}/chatbots/${id}`, chatbotData, { headers: getAuthHeader() });
        return response.data;
    },

    // Eliminar chatbot
    eliminarChatbot: async (id) => {
        const response = await axios.delete(`${API_BASE}/chatbots/${id}`, { headers: getAuthHeader() });
        return response.data;
    },

    // Eliminar categoría
    eliminarCategoria: async (nombre) => {
        // Intentamos el endpoint específico si existe
        try {
            const response = await axios.delete(`${API_BASE}/chatbots/categories/${encodeURIComponent(nombre)}`, { headers: getAuthHeader() });
            return response.data;
        } catch (error) {
            console.warn("No se pudo eliminar la categoría vía endpoint", error);
            throw error;
        }
    }
};

export default chatbotService;
