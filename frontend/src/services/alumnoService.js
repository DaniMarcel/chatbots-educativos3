import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'https://chatbots-educativos3-vhfq.onrender.com/api';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

const alumnoService = {
    // Obtener perfil del alumno
    getPerfil: async () => {
        const response = await axios.get(`${API_BASE}/alumnos/me`, { headers: getAuthHeader() });
        return response.data;
    },

    // Obtener chatbots y videos permitidos
    getPermitidos: async () => {
        const response = await axios.get(`${API_BASE}/mis-chatbots-permitidos`, { headers: getAuthHeader() });
        return response.data;
    }
};

export default alumnoService;
