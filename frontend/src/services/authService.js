import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'https://chatbots-educativos3-vhfq.onrender.com/api';

const authService = {
    // Login Alumno
    loginAlumno: async (rut) => {
        const response = await axios.post(`${API_BASE}/login`, { rut });
        return response.data;
    },

    // Login Admin/Profesor
    loginAdmin: async (rut, contrasena) => {
        const response = await axios.post(`${API_BASE}/admin/login`, { rut, contrasena });
        return response.data;
    },

    // Registro Alumno
    registroAlumno: async (alumnoData, token) => {
        const response = await axios.post(`${API_BASE}/registro`, alumnoData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    // Recuperar Contraseña
    recuperarContrasena: async (correo) => {
        const response = await axios.post(`${API_BASE}/password/forgot`, { correo });
        return response.data;
    }
};

export default authService;
