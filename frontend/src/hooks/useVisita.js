import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import visitaService from '../services/visitaService';

export default function useVisita() {
    const navigate = useNavigate();
    const [seccion, setSeccion] = useState('inicio');
    const [config, setConfig] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [error, setError] = useState(null);

    const toggleSidebar = () => {
        setSidebarOpen(!isSidebarOpen);
    };

    const fetchConfig = useCallback(async () => {
        setCargando(true);
        try {
            const data = await visitaService.getConfig();
            setConfig(data);
        } catch (err) {
            console.error("Error fetching guest panel config", err);
            setError("No se pudo cargar la configuración del panel.");
        } finally {
            setCargando(false);
        }
    }, []);

    useEffect(() => {
        fetchConfig();
    }, [fetchConfig]);

    // Auto-logout timer (30 minutes)
    useEffect(() => {
        const timeout = setTimeout(() => {
            alert('Tu sesión de visita ha expirado. Serás redirigido a la página principal.');
            navigate('/');
        }, 30 * 60 * 1000);

        return () => clearTimeout(timeout);
    }, [navigate]);

    const cerrarSesion = () => {
        navigate('/');
    };

    const handleNavClick = (nuevaSeccion) => {
        setSeccion(nuevaSeccion);
        if (window.innerWidth <= 992) {
            setSidebarOpen(false);
        }
    };

    return {
        seccion,
        config,
        cargando,
        isSidebarOpen,
        error,
        toggleSidebar,
        handleNavClick,
        cerrarSesion
    };
}
