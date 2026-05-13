import axios from 'axios';
import API_BASE from './apiConfig';

const visitaService = {
    // Obtener configuración del panel de visita
    getConfig: async () => {
        const response = await axios.get(`${API_BASE}/guest-panel`);
        return response.data;
    }
};

export default visitaService;
