import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'https://chatbots-educativos3-vhfq.onrender.com/api';

const visitaService = {
    // Obtener configuración del panel de visita
    getConfig: async () => {
        const response = await axios.get(`${API_BASE}/guest-panel`);
        return response.data;
    }
};

export default visitaService;
