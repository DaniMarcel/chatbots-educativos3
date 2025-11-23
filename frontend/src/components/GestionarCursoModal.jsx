import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { JORNADAS, nombreDe, docDe } from '../utils/userHelpers';
import courseService from '../services/courseService';

export default function GestionarCursoModal({
    curso, onClose,
    cats, catMap, chatbots,
    asignarChatbot, fetchCursoDetallado
}) {
    const [catSel, setCatSel] = useState(() => {
        const found = chatbots.find(b => (b._id || b.id) === (curso?.chatbotId || ""));
        return found?.categoria || "";
    });

    // Todos mis alumnos (los creados por este profe)
    const [misAlumnos, setMisAlumnos] = useState([]);
    const [cargandoAlumnos, setCargandoAlumnos] = useState(false);
    const [toggling, setToggling] = useState({}); // { [alumnoId]: true }
    const [jornadaFilter, setJornadaFilter] = useState(""); // Filtro por jornada

    useEffect(() => {
        document.body.classList.add("cp-no-scroll");
        return () => document.body.classList.remove("cp-no-scroll");
    }, []);

    // Cargar todos los alumnos del profe (sin buscador)
    const fetchMisAlumnos = useCallback(async () => {
        setCargandoAlumnos(true);
        try {
            const list = await courseService.getMisAlumnos();
            // Ordenar por nombre
            list.sort((a, b) => nombreDe(a).localeCompare(nombreDe(b), "es"));
            setMisAlumnos(list);
        } catch (e) {
            alert(e.message || "No se pudieron cargar alumnos");
            setMisAlumnos([]);
        } finally {
            setCargandoAlumnos(false);
        }
    }, []);

    useEffect(() => { fetchMisAlumnos(); }, [fetchMisAlumnos]);

    // Filtrar alumnos por jornada
    const alumnosFiltrados = useMemo(() => {
        return misAlumnos.filter(a => !jornadaFilter || a.jornada === jornadaFilter);
    }, [misAlumnos, jornadaFilter]);

    // Inscribir (habilitar) / Quitar (deshabilitar)
    const agregarAlumnos = useCallback(async (alumnoIds) => {
        if (!alumnoIds?.length) return;
        const id = alumnoIds[0];
        setToggling((s) => ({ ...s, [id]: true }));
        try {
            await courseService.inscribirAlumnos(curso._id, alumnoIds);
            await fetchCursoDetallado(curso._id);
        } catch (e) { alert(e.message || "Error al habilitar"); }
        finally { setToggling((s) => { const n = { ...s }; delete n[id]; return n; }); }
    }, [curso?._id, fetchCursoDetallado]);

    const quitarAlumno = useCallback(async (alumnoId) => {
        setToggling((s) => ({ ...s, [alumnoId]: true }));
        try {
            await courseService.desinscribirAlumno(curso._id, alumnoId);
            await fetchCursoDetallado(curso._id);
        } catch (e) { alert(e.message || "Error al deshabilitar"); }
        finally { setToggling((s) => { const n = { ...s }; delete n[alumnoId]; return n; }); }
    }, [curso?._id, fetchCursoDetallado]);

    // Set de inscritos para este curso (para decidir el botón)
    const inscritosSet = useMemo(() => {
        const ids = (curso?.alumnos || []).map(x => typeof x === "string" ? x : x._id);
        return new Set(ids);
    }, [curso?.alumnos]);

    return (
        <div className="mgm-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }} role="dialog" aria-modal="true">
            <div className="mgm-modal" onMouseDown={(e) => e.stopPropagation()}>
                <div className="mgm-header">
                    <h4 className="mgm-title">Gestionar alumnos — {curso?.nombre ?? "Curso"}</h4>
                    <div className="mgm-meta">
                        <span>{curso?.anio ?? "—"}</span>
                        <span>Sem {curso?.semestre ?? "—"}</span>
                        <span>{curso?.jornada ?? "—"}</span>
                    </div>
                </div>

                {/* Filtros mínimos de chatbot (sin buscador de alumnos) */}
                <div className="mgm-toolbar">
                    <div className="mgm-field">
                        <label>Categoría</label>
                        <select
                            className="cp-select"
                            value={catSel}
                            onChange={async (e) => {
                                const val = e.target.value;
                                setCatSel(val);
                                const actual = chatbots.find(b => (b._id || b.id) === (curso?.chatbotId || ""));
                                if (actual && actual.categoria !== val) {
                                    await asignarChatbot(curso._id, null);
                                }
                            }}
                        >
                            <option value="">— Selecciona —</option>
                            {cats.map(cat => <option key={cat} value={cat} title={cat}>{cat}</option>)}
                        </select>
                    </div>

                    <div className="mgm-field">
                        <label>Chatbot</label>
                        <select
                            className="cp-select"
                            value={curso?.chatbotId || ""}
                            onChange={(e) => asignarChatbot(curso._id, e.target.value || null)}
                            disabled={!catSel}
                        >
                            <option value="">— Sin chatbot —</option>
                            {(catSel ? (catMap[catSel] || []) : []).map((cb) => {
                                const id = cb._id || cb.id;
                                return (
                                    <option key={id} value={id} title={cb.nombre}>
                                        {cb.nombre}
                                    </option>
                                );
                            })}
                        </select>
                    </div>

                    <div className="mgm-spacer" />
                </div>

                {/* Única tabla: Resultados (todos mis alumnos) con acción Habilitar/Deshabilitar */}
                <div className="mgm-block">
                    <div className="mgm-block-title">
                        Resultados <span className="mgm-count">{alumnosFiltrados.length}</span>
                        <select
                            className="cp-select"
                            value={jornadaFilter}
                            onChange={(e) => setJornadaFilter(e.target.value)}
                            style={{ marginLeft: '10px', width: 'auto' }}
                        >
                            <option value="">Todas las jornadas</option>
                            {JORNADAS.map((j) => <option key={j} value={j}>{j}</option>)}
                        </select>
                        <button className="btn btn-secondary" onClick={fetchMisAlumnos} style={{ marginLeft: '10px' }}>
                            Refrescar alumnos
                        </button>
                    </div>
                    <div className="cp-table-clip">
                        <table className="cp-table">
                            <colgroup>
                                <col className="cp-col-doc" /><col className="cp-col-name" /><col className="cp-col-min" /><col className="cp-col-min" /><col className="cp-col-min" />
                            </colgroup>
                            <thead><tr><th>RUT/DNI</th><th>Nombre</th><th>Semestre</th><th>Jornada</th><th>Acción</th></tr></thead>
                            <tbody>
                                {cargandoAlumnos ? (
                                    <tr><td colSpan="5">Cargando alumnos…</td></tr>
                                ) : (alumnosFiltrados.length ? (
                                    alumnosFiltrados.map((a) => {
                                        const id = a._id;
                                        const inscrito = inscritosSet.has(id);
                                        const btnBusy = !!toggling[id];
                                        return (
                                            <tr key={id}>
                                                <td>{docDe(a)}</td>
                                                <td title={nombreDe(a)} className="cp-ellipsis">{nombreDe(a)}</td>
                                                <td>{a.semestre ?? "—"}</td>
                                                <td>{a.jornada ?? "—"}</td>
                                                <td>
                                                    {inscrito ? (
                                                        <button
                                                            className="btn btn-danger cp-btn-block"
                                                            onClick={() => quitarAlumno(id)}
                                                            disabled={btnBusy}
                                                            title="Deshabilitar acceso a este curso"
                                                        >
                                                            {btnBusy ? "…" : "Deshabilitar"}
                                                        </button>
                                                    ) : (
                                                        <button
                                                            className="btn btn-primary cp-btn-block"
                                                            onClick={() => agregarAlumnos([id])}
                                                            disabled={btnBusy}
                                                            title="Habilitar acceso a este curso"
                                                        >
                                                            {btnBusy ? "…" : "Habilitar"}
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr><td colSpan="5">No tienes alumnos creados aún.</td></tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="mgm-footer">
                    <button className="btn btn-ghost" onClick={onClose}>Cerrar</button>
                </div>
            </div>
        </div>
    );
}
