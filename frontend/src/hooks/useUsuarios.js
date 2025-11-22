import { useState, useEffect, useCallback, useMemo } from 'react';
import { userService } from '../services/userService';
import { getAnio, getApellido } from '../utils/userHelpers';
import Swal from 'sweetalert2';

export const useUsuarios = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [tipoUsuario, setTipoUsuario] = useState('alumnos');
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState('');

    // Filters state
    const [filtroTexto, setFiltroTexto] = useState('');
    const [filtroJornada, setFiltroJornada] = useState('');
    const [filtroSemestre, setFiltroSemestre] = useState('');
    const [filtroAnio, setFiltroAnio] = useState('');

    // Selection state
    const [seleccion, setSeleccion] = useState([]);
    const [eliminandoMasivo, setEliminandoMasivo] = useState(false);

    const obtenerUsuarios = useCallback(async () => {
        try {
            setCargando(true);
            setError('');
            const data = await userService.getUsuarios(tipoUsuario);
            const lista = Array.isArray(data) ? data : (data?.items || []);
            setUsuarios(lista);
            setSeleccion([]);
        } catch (err) {
            console.error('Error al obtener usuarios', err);
            setUsuarios([]);
            setError(err?.response?.data?.msg || 'No se pudieron cargar los usuarios.');
        } finally {
            setCargando(false);
        }
    }, [tipoUsuario]);

    useEffect(() => {
        obtenerUsuarios();
        // Reset filters when user type changes
        setFiltroTexto('');
        setFiltroJornada('');
        setFiltroSemestre('');
        setFiltroAnio('');
        setSeleccion([]);
    }, [obtenerUsuarios]);

    const eliminarUsuario = async (u) => {
        const tipo = tipoUsuario === 'alumnos' ? 'alumno' : 'profesor';
        const { isConfirmed } = await Swal.fire({
            title: `Eliminar ${tipo}`,
            html: `¿Seguro que quieres eliminar a <b>${u.nombre || ''} ${u.apellido || u.apellidos || ''}</b>?<br/>Esta acción no se puede deshacer.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
        });

        if (!isConfirmed) return;

        try {
            await userService.deleteUsuario(tipoUsuario, u._id);
            await Swal.fire('Eliminado', `${tipo.charAt(0).toUpperCase() + tipo.slice(1)} eliminado correctamente.`, 'success');
            obtenerUsuarios();
        } catch (err1) {
            // Fallback logic for professors from original code
            const status = err1?.response?.status;
            const notFoundish = status === 404 || status === 405 || status === 400;

            if (tipoUsuario === 'profesores' && notFoundish) {
                try {
                    await userService.deleteProfesorAdmin(u._id);
                    await Swal.fire('Eliminado', 'Profesor eliminado correctamente (compat).', 'success');
                    obtenerUsuarios();
                    return;
                } catch (err2) {
                    console.error('Error fallback eliminar profesor:', err2);
                    Swal.fire('Error', err2?.response?.data?.msg || 'No se pudo eliminar (compat).', 'error');
                    return;
                }
            }

            console.error('Error al eliminar:', err1);
            Swal.fire('Error', err1?.response?.data?.msg || 'No se pudo eliminar.', 'error');
        }
    };

    const eliminarAlumnosSeleccionados = async (puedeEliminarAlumnos) => {
        if (tipoUsuario !== 'alumnos') return;
        if (!puedeEliminarAlumnos) {
            Swal.fire('Permiso insuficiente', 'No tienes permiso para eliminar alumnos.', 'warning');
            return;
        }
        if (!seleccion.length) return;

        const count = seleccion.length;
        const { isConfirmed } = await Swal.fire({
            title: `Eliminar ${count} alumno${count > 1 ? 's' : ''}`,
            html: `¿Seguro que deseas eliminar <b>${count}</b> alumno${count > 1 ? 's' : ''}?<br/>Esta acción no se puede deshacer.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
        });
        if (!isConfirmed) return;

        try {
            setEliminandoMasivo(true);
            const promises = seleccion.map(id => userService.deleteAlumno(id));
            const results = await Promise.allSettled(promises);

            const ok = results.filter(r => r.status === 'fulfilled').length;
            const fail = results.length - ok;

            if (fail === 0) {
                await Swal.fire('Listo', `Se eliminaron ${ok} alumno${ok > 1 ? 's' : ''}.`, 'success');
            } else {
                await Swal.fire({
                    title: 'Proceso finalizado',
                    html: `Eliminados: <b>${ok}</b><br/>Fallidos: <b>${fail}</b><br/><small>Revisa consola para detalles.</small>`,
                    icon: 'info'
                });
            }
            setSeleccion([]);
            obtenerUsuarios();
        } catch (e) {
            console.error('Error en eliminación masiva:', e);
            Swal.fire('Error', 'No se pudo completar la eliminación masiva.', 'error');
        } finally {
            setEliminandoMasivo(false);
        }
    };

    // Derived state and filters logic
    const opcionesSemestre = useMemo(() => {
        if (tipoUsuario !== 'alumnos') return [];
        const set = new Set(
            (usuarios || []).map(u => (u.semestre ?? '').toString().trim()).filter(Boolean)
        );
        const arr = Array.from(set);
        arr.sort((a, b) => Number(a) - Number(b));
        return arr;
    }, [usuarios, tipoUsuario]);

    const opcionesAnio = useMemo(() => {
        const set = new Set(
            (usuarios || []).map(u => {
                const a = getAnio(u);
                return a ? String(a) : null;
            }).filter(Boolean)
        );
        const arr = Array.from(set);
        arr.sort((a, b) => Number(b) - Number(a));
        return arr;
    }, [usuarios]);

    const usuariosFiltrados = useMemo(() => {
        const texto = filtroTexto.toLowerCase().trim();
        return (usuarios || []).filter(u => {
            const base = [
                u.correo, u.nombre, getApellido(u),
                ...(tipoUsuario === 'alumnos' ? [u.numero_documento] : []),
                u.rut, u.cargo, u.telefono
            ].filter(Boolean).join(' ').toLowerCase();

            if (texto && !base.includes(texto)) return false;

            if (filtroAnio) {
                const anio = getAnio(u);
                if (String(anio) !== String(filtroAnio)) return false;
            }
            if (tipoUsuario === 'alumnos') {
                if (filtroJornada && String(u.jornada || '').toLowerCase() !== filtroJornada.toLowerCase()) return false;
                if (filtroSemestre && String(u.semestre) !== String(filtroSemestre)) return false;
            }
            return true;
        });
    }, [usuarios, tipoUsuario, filtroTexto, filtroJornada, filtroSemestre, filtroAnio]);

    const allFilteredIds = useMemo(() => (
        tipoUsuario === 'alumnos' ? usuariosFiltrados.map(u => u._id) : []
    ), [usuariosFiltrados, tipoUsuario]);

    const allFilteredSelected = useMemo(() => (
        allFilteredIds.length > 0 && allFilteredIds.every(id => seleccion.includes(id))
    ), [allFilteredIds, seleccion]);

    const toggleSelect = (id) => {
        setSeleccion(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const toggleSelectAllFiltered = () => {
        if (allFilteredSelected) {
            setSeleccion(prev => prev.filter(id => !allFilteredIds.includes(id)));
        } else {
            setSeleccion(prev => Array.from(new Set([...prev, ...allFilteredIds])));
        }
    };

    return {
        usuarios,
        usuariosFiltrados,
        tipoUsuario,
        setTipoUsuario,
        cargando,
        error,
        obtenerUsuarios,
        eliminarUsuario,
        eliminarAlumnosSeleccionados,
        opcionesSemestre,
        opcionesAnio,
        filtros: {
            texto: filtroTexto,
            setTexto: setFiltroTexto,
            jornada: filtroJornada,
            setJornada: setFiltroJornada,
            semestre: filtroSemestre,
            setSemestre: setFiltroSemestre,
            anio: filtroAnio,
            setAnio: setFiltroAnio
        },
        seleccion: {
            ids: seleccion,
            setIds: setSeleccion,
            eliminandoMasivo,
            toggleSelect,
            toggleSelectAllFiltered,
            allFilteredSelected,
            allFilteredIds
        }
    };
};
