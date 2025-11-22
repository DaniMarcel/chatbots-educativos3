import React from 'react';

const JORNADAS = ['Mañana', 'Tarde', 'Vespertino', 'Viernes', 'Sábados'];

const UserFilters = ({
    tipoUsuario,
    filtros,
    opcionesSemestre,
    opcionesAnio,
    limpiarFiltros,
    exportarExcel,
    seleccion,
    eliminarAlumnosSeleccionados,
    puedeEliminarAlumnos
}) => {
    const isAlum = tipoUsuario === 'alumnos';
    const { texto, setTexto, jornada, setJornada, semestre, setSemestre, anio, setAnio } = filtros;
    const { ids, eliminandoMasivo } = seleccion;

    return (
        <div className="filtros-bar">
            <input
                type="text"
                placeholder="Buscar por correo, nombre, apellido, documento…"
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                className="filtro-input"
            />

            {isAlum && (
                <>
                    <select value={jornada} onChange={(e) => setJornada(e.target.value)} className="filtro-select">
                        <option value="">Jornada: Todas</option>
                        {JORNADAS.map(j => <option key={j} value={j}>{j}</option>)}
                    </select>

                    <select value={semestre} onChange={(e) => setSemestre(e.target.value)} className="filtro-select">
                        <option value="">Semestre: Todos</option>
                        {opcionesSemestre.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                </>
            )}

            <select value={anio} onChange={(e) => setAnio(e.target.value)} className="filtro-select">
                <option value="">Año: Todos</option>
                {opcionesAnio.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>

            <button className="btn-sec" onClick={limpiarFiltros}>Limpiar</button>
            <button className="btn-prim" onClick={exportarExcel}>Descargar Excel (filtrado)</button>

            {isAlum && (
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginLeft: 'auto' }}>
                    <span style={{ fontSize: 12, opacity: .8 }}>
                        Seleccionados: <b>{ids.length}</b>
                    </span>
                    <button
                        className="btn-edit"
                        onClick={() => eliminarAlumnosSeleccionados(puedeEliminarAlumnos)}
                        disabled={!puedeEliminarAlumnos || !ids.length || eliminandoMasivo}
                        title={!puedeEliminarAlumnos ? 'No tienes permiso para eliminar alumnos' : undefined}
                    >
                        {eliminandoMasivo ? 'Eliminando…' : 'Eliminar seleccionados'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default UserFilters;
