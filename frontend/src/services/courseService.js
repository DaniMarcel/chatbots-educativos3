import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'https://chatbots-educativos3-vhfq.onrender.com/api';

const getAuthHeader = () => {
    const token = localStorage.getItem('token') || '';
    return { Authorization: `Bearer ${token}` };
};

const courseService = {
    // Obtener cursos de un profesor
    getCursos: async (profesorId) => {
        const url = `${API_BASE}/cursos${profesorId ? `?profesor=${profesorId}` : ''}`;
        const response = await axios.get(url, { headers: getAuthHeader() });
        return response.data;
    },

    // Obtener un curso detallado (con alumnos populados)
    getCursoDetallado: async (cursoId) => {
        const response = await axios.get(`${API_BASE}/cursos/${cursoId}?populate=1`, { headers: getAuthHeader() });
        return response.data;
    },

    // Crear un nuevo curso
    crearCurso: async (cursoData) => {
        const response = await axios.post(`${API_BASE}/cursos`, cursoData, { headers: getAuthHeader() });
        return response.data;
    },

    // Eliminar un curso
    eliminarCurso: async (cursoId) => {
        const response = await axios.delete(`${API_BASE}/cursos/${cursoId}`, { headers: getAuthHeader() });
        return response.data;
    },

    // Asignar chatbot a un curso
    asignarChatbot: async (cursoId, chatbotId) => {
        const response = await axios.post(
            `${API_BASE}/cursos/${cursoId}/chatbot`,
            { chatbotId },
            { headers: getAuthHeader() }
        );
        return response.data;
    },

    // Obtener alumnos (del profesor actual)
    getMisAlumnos: async () => {
        const response = await axios.get(`${API_BASE}/alumnos`, { headers: getAuthHeader() });
        return response.data;
    },

    // Inscribir alumnos a un curso
    inscribirAlumnos: async (cursoId, alumnoIds) => {
        const response = await axios.post(
            `${API_BASE}/cursos/${cursoId}/alumnos`,
            { alumnoIds },
            { headers: getAuthHeader() }
        );
        return response.data;
    },

    // Desinscribir alumno de un curso
    desinscribirAlumno: async (cursoId, alumnoId) => {
        const response = await axios.delete(
            `${API_BASE}/cursos/${cursoId}/alumnos/${alumnoId}`,
            { headers: getAuthHeader() }
        );
        return response.data;
    },

    // Obtener chatbots disponibles
    getChatbots: async () => {
        const response = await axios.get(`${API_BASE}/chatbots`, { headers: getAuthHeader() });
        return response.data;
    }
};

export default courseService;
