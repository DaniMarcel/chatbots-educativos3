import axios from 'axios';

// TODO: Move this to an environment variable
const API_BASE = 'https://chatbots-educativos3-vhfq.onrender.com/api';

const getAuthHeader = () => {
    const token = localStorage.getItem('token') || '';
    return { Authorization: `Bearer ${token}` };
};

export const userService = {
    getUsuarios: async (tipoUsuario) => {
        const endpointPath = tipoUsuario === 'alumnos' ? '/alumnos' : '/admin/profesores';
        const response = await axios.get(`${API_BASE}${endpointPath}`, {
            headers: getAuthHeader(),
        });
        return response.data;
    },

    updateUsuario: async (tipoUsuario, id, data) => {
        const endpointPath = tipoUsuario === 'alumnos' ? '/alumnos' : '/admin/profesores';
        const response = await axios.put(`${API_BASE}${endpointPath}/${id}`, data, {
            headers: getAuthHeader(),
        });
        return response.data;
    },

    deleteUsuario: async (tipoUsuario, id) => {
        const endpointPath = tipoUsuario === 'alumnos' ? '/alumnos' : '/admin/profesores';
        const response = await axios.delete(`${API_BASE}${endpointPath}/${id}`, {
            headers: getAuthHeader(),
        });
        return response.data;
    },

    // Fallback specific for professors as seen in original code
    deleteProfesorAdmin: async (id) => {
        const response = await axios.delete(`${API_BASE}/admin/${id}`, {
            headers: getAuthHeader(),
        });
        return response.data;
    },

    deleteAlumno: async (id) => {
        return axios.delete(`${API_BASE}/alumnos/${id}`, { headers: getAuthHeader() });
    }
};
