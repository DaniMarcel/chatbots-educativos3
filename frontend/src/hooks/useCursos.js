import { useState, useCallback, useEffect } from 'react';
import courseService from '../services/courseService';

export default function useCursos() {
    const [cursos, setCursos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [chatbots, setChatbots] = useState([]);
    const [cats, setCats] = useState([]);
    const [catMap, setCatMap] = useState({});

    const me = JSON.parse(localStorage.getItem("usuario") || "{}");

    const fetchCursos = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await courseService.getCursos(me?._id);
            setCursos(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error("fetchCursos error", e);
            setError("No se pudo contactar al servidor de cursos.");
            setCursos([]);
        } finally {
            setLoading(false);
        }
    }, [me?._id]);

    const fetchChatbots = useCallback(async () => {
        try {
            const list = await courseService.getChatbots();
            setChatbots(list);

            const byCat = {};
            for (const cb of list) {
                const cat = cb.categoria || "Sin categoría";
                (byCat[cat] ||= []).push(cb);
            }
            Object.values(byCat).forEach(arr => arr.sort((a, b) => (a.nombre || "").localeCompare(b.nombre || "", "es")));
            setCatMap(byCat);
            setCats(Object.keys(byCat).sort((a, b) => a.localeCompare(b, "es")));
        } catch (e) {
            console.warn("fetchChatbots error", e);
            setChatbots([]); setCats([]); setCatMap({});
        }
    }, []);

    const crearCurso = async (payload) => {
        const clean = {
            nombre: (payload.nombre || "").trim(),
            descripcion: (payload.descripcion || "").trim(),
            jornada: payload.jornada || undefined,
            anio: /^\d{4}$/.test(String(payload.anio)) ? Number(payload.anio) : undefined,
            semestre: ["1", "2", 1, 2].includes(payload.semestre) ? Number(payload.semestre) : undefined,
            profesorId: me?._id,
        };
        try {
            const nuevo = await courseService.crearCurso(clean);
            setCursos((prev) => [nuevo, ...prev]);
            return true;
        } catch (e) {
            alert(e.message || "No se pudo crear el curso");
            return false;
        }
    };

    const eliminarCurso = async (id) => {
        if (!window.confirm("¿Eliminar este curso?")) return;
        try {
            await courseService.eliminarCurso(id);
            setCursos((prev) => prev.filter((c) => c._id !== id));
        } catch (e) {
            alert(e.message || "Error al eliminar curso");
        }
    };

    const asignarChatbot = async (cursoId, chatbotId) => {
        const clean = (v) => (v && v !== "undefined" ? v : null);
        try {
            const upd = await courseService.asignarChatbot(cursoId, clean(chatbotId));
            setCursos((prev) => prev.map((c) => (c._id === upd._id ? upd : c)));
            return upd;
        } catch (e) {
            alert(e.message || "Error asignando chatbot");
            return null;
        }
    };

    const fetchCursoDetallado = useCallback(async (cursoId) => {
        try {
            const curso = await courseService.getCursoDetallado(cursoId);
            setCursos((prev) =>
                prev.map((c) =>
                    c._id === curso._id
                        ? {
                            ...c,
                            alumnos: curso.alumnos?.map((a) => a._id) ?? [],
                            chatbotId: curso.chatbotId || null,
                        }
                        : c
                )
            );
            return curso;
        } catch (e) {
            console.error("fetchCursoDetallado", e);
            alert(e.message || "No se pudo cargar el curso.");
            return null;
        }
    }, []);

    useEffect(() => {
        fetchCursos();
        fetchChatbots();
    }, [fetchCursos, fetchChatbots]);

    return {
        cursos,
        loading,
        error,
        chatbots,
        cats,
        catMap,
        fetchCursos,
        fetchChatbots,
        crearCurso,
        eliminarCurso,
        asignarChatbot,
        fetchCursoDetallado
    };
}
