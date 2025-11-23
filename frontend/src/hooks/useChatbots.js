import { useState, useCallback, useEffect } from 'react';
import chatbotService from '../services/chatbotService';

export default function useChatbots() {
    const [cats, setCats] = useState([]);
    const [selCat, setSelCat] = useState("");
    const [bots, setBots] = useState([]);
    const [loadingCats, setLoadingCats] = useState(false);
    const [loadingBots, setLoadingBots] = useState(false);
    const [error, setError] = useState(null);

    const fetchCategorias = useCallback(async () => {
        setLoadingCats(true);
        try {
            const data = await chatbotService.getCategorias();
            // data es [{categoria: 'Name', count: 10}, ...]
            // Mapeamos 'categoria' a 'nombre' si es necesario
            const list = (Array.isArray(data) ? data : [])
                .map(x => ({ nombre: x.nombre || x.categoria, count: x.count }))
                .filter(x => x.nombre);
            setCats(list);

            // Si no hay categoría seleccionada y hay categorías, seleccionar la primera
            if (!selCat && list.length > 0) {
                setSelCat(list[0].nombre);
            }
        } catch (e) {
            console.error("fetchCategorias error", e);
            setError("Error al cargar categorías");
        } finally {
            setLoadingCats(false);
        }
    }, [selCat]);

    const fetchBots = useCallback(async (catName) => {
        if (!catName) {
            setBots([]);
            return;
        }
        setLoadingBots(true);
        try {
            const data = await chatbotService.getChatbots(catName);
            setBots(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error("fetchBots error", e);
            setError("Error al cargar chatbots");
            setBots([]);
        } finally {
            setLoadingBots(false);
        }
    }, []);

    // Cargar bots cuando cambia la categoría seleccionada
    useEffect(() => {
        if (selCat) {
            fetchBots(selCat);
        }
    }, [selCat, fetchBots]);

    // Cargar categorías al montar
    useEffect(() => {
        fetchCategorias();
    }, [fetchCategorias]);

    const crearChatbot = async (payload) => {
        try {
            await chatbotService.crearChatbot(payload);
            // Recargar bots de la categoría actual (o la nueva)
            if (selCat === payload.categoria) {
                await fetchBots(selCat);
            } else {
                // Si es nueva categoría, recargar categorías
                await fetchCategorias();
                setSelCat(payload.categoria);
            }
            return true;
        } catch (e) {
            alert(e.message || "Error al crear chatbot");
            return false;
        }
    };

    const actualizarChatbot = async (id, payload) => {
        try {
            await chatbotService.actualizarChatbot(id, payload);
            await fetchBots(selCat);
            return true;
        } catch (e) {
            alert(e.message || "Error al actualizar chatbot");
            return false;
        }
    };

    const eliminarChatbot = async (id) => {
        if (!window.confirm("¿Eliminar este chatbot?")) return;
        try {
            await chatbotService.eliminarChatbot(id);
            await fetchBots(selCat);
            // Actualizar conteo de categorías
            fetchCategorias();
        } catch (e) {
            alert(e.message || "Error al eliminar chatbot");
        }
    };

    const eliminarCategoria = async (nombre) => {
        // Verificar si la categoría tiene chatbots
        const cat = cats.find(c => c.nombre === nombre);
        if (cat && cat.count > 0) {
            alert(`La categoría "${nombre}" no está vacía (${cat.count} chatbots). Elimina los chatbots primero.`);
            return;
        }

        if (!window.confirm(`¿Eliminar la categoría vacía "${nombre}"?`)) return;
        try {
            await chatbotService.eliminarCategoria(nombre);
            setSelCat(""); // Deseleccionar
            await fetchCategorias();
        } catch (e) {
            alert("No se pudo eliminar la categoría. " + (e.response?.data?.msg || e.message));
        }
    };

    return {
        cats,
        selCat,
        setSelCat,
        bots,
        loadingCats,
        loadingBots,
        error,
        fetchCategorias,
        fetchBots,
        crearChatbot,
        actualizarChatbot,
        eliminarChatbot,
        eliminarCategoria
    };
}
