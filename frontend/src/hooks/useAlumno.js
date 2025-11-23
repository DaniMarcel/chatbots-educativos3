import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import alumnoService from '../services/alumnoService';

function getYouTubeID(url) {
    if (!url) return '';
    const arr = url.split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
    return (arr[2] !== undefined) ? arr[2].split(/[^0-9a-z_-]/i)[0] : arr[0];
}

export default function useAlumno() {
    const navigate = useNavigate();
    const [usuario, setUsuario] = useState(null);
    const [permitidos, setPermitidos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lastLoadedAt, setLastLoadedAt] = useState(null);
    const [activeIframeSrc, setActiveIframeSrc] = useState(() => localStorage.getItem('activeIframeSrc') || null);
    const [expandedVideoCat, setExpandedVideoCat] = useState({});

    const fetchDatos = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const [perfilData, permitidosData] = await Promise.all([
                alumnoService.getPerfil(),
                alumnoService.getPermitidos()
            ]);

            setUsuario(perfilData);
            localStorage.setItem('usuario', JSON.stringify(perfilData));

            const list = (Array.isArray(permitidosData) ? permitidosData : [])
                .filter(x => x && x.chatbotId && x.activo !== false)
                .map(x => ({
                    _id: String(x.chatbotId),
                    nombre: x.nombre || 'Chatbot',
                    categoria: x.categoria || 'General',
                    embedUrl: x.iframeUrl,
                    videos: x.videos || [],
                }))
                .sort((a, b) => (a.categoria || '').localeCompare(b.categoria || '', 'es')
                    || (a.nombre || '').localeCompare(b.nombre || '', 'es'));

            setPermitidos(list);
            setLastLoadedAt(new Date());
        } catch (error) {
            console.error("Error cargando datos alumno:", error);
            if (error.response && error.response.status === 401) {
                cerrarSesion();
            }
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        fetchDatos();
    }, [fetchDatos]);

    // Refrescar al volver a la pestaña
    useEffect(() => {
        const onVisible = () => document.visibilityState === 'visible' && fetchDatos();
        document.addEventListener('visibilitychange', onVisible);
        return () => document.removeEventListener('visibilitychange', onVisible);
    }, [fetchDatos]);

    const cerrarSesion = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        navigate('/login');
    };

    const updateActiveIframeSrc = (src) => {
        setActiveIframeSrc(src);
        if (src) {
            localStorage.setItem('activeIframeSrc', src);
        } else {
            localStorage.removeItem('activeIframeSrc');
        }
    };

    // Lógica derivada (Riesgo)
    const { riesgo, estadoCuentaTexto, riskClass, deudaLabel } = useMemo(() => {
        if (!usuario) return { riesgo: '', estadoCuentaTexto: '', riskClass: '', deudaLabel: '' };

        let r = '';
        if (usuario.habilitado === false) {
            r = 'rojo';
        } else {
            r = String(usuario.riesgo || usuario.color_riesgo || usuario.riesgo_color || '').toLowerCase();
            if (!r && usuario.suscripcionVenceEl) {
                const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
                const end = new Date(usuario.suscripcionVenceEl); end.setHours(0, 0, 0, 0);
                if (!Number.isNaN(end.getTime())) {
                    const diff = Math.floor((end - hoy) / 86400000);
                    r = diff < 0 ? 'rojo' : diff <= 10 ? 'amarillo' : 'verde';
                }
            }
        }
        if (!['verde', 'amarillo', 'rojo'].includes(r)) r = '';

        const estadoCuentaTexto = (r === 'rojo' || usuario?.habilitado === false) ? 'Suspendido' : 'Habilitado';
        const riskClass = r === 'verde' ? 'badge badge-verde' : r === 'amarillo' ? 'badge badge-amarillo' : r === 'rojo' ? 'badge badge-rojo' : 'badge';
        const deudaLabel = r === 'amarillo' ? 'Suspensión en 10 días' : 'Deudas al día';

        return { riesgo: r, estadoCuentaTexto, riskClass, deudaLabel };
    }, [usuario]);

    // Listas derivadas
    const chatbots = useMemo(() => permitidos.filter(p => p.embedUrl), [permitidos]);

    const videos = useMemo(() =>
        permitidos.flatMap(p =>
            (p.videos || []).map(v => ({
                ...v,
                categoria: p.categoria,
                chatbotNombre: p.nombre,
                chatbotId: p._id,
                youtubeId: getYouTubeID(v.url)
            }))
        ), [permitidos]);

    const gruposVideos = useMemo(() => {
        const map = new Map();
        for (const v of videos) {
            const k = v.categoria || 'General';
            if (!map.has(k)) map.set(k, []);
            map.get(k).push(v);
        }
        return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0], 'es'));
    }, [videos]);

    return {
        usuario,
        loading,
        lastLoadedAt,
        chatbots,
        gruposVideos,
        riesgo,
        estadoCuentaTexto,
        riskClass,
        deudaLabel,
        activeIframeSrc,
        updateActiveIframeSrc,
        expandedVideoCat,
        setExpandedVideoCat,
        cerrarSesion
    };
}
