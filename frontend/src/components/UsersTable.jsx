import React from 'react';
import { getApellido, getFechaCreacion, getAnio, deriveRiesgo, riesgoMensajeFE } from '../utils/userHelpers';

const RiesgoBadge = ({ value }) => {
    const v = String(value || '').toLowerCase();
    const map = {
        verde: { bg: '#e8f7e8', color: '#137a2a', label: 'Verde' },
        amarillo: { bg: '#fff7cc', color: '#8a6d00', label: 'Amarillo' },
        rojo: { bg: '#ffe1dd', color: '#9b1c1c', label: 'Rojo' },
    };
    const sty = map[v] || { bg: '#eef2f7', color: '#334155', label: v || '-' };
    return (
        <span style={{ background: sty.bg, color: sty.color, padding: '4px 8px', borderRadius: 999, fontSize: 12, fontWeight: 700 }}>
            {sty.label}
        </span>
    );
};

const UsersTable = ({
    usuarios,
    tipoUsuario,
    cargando,
    seleccion,
    toggleSelect,
    toggleSelectAllFiltered,
    allFilteredSelected,
    allFilteredIds,
    handleEditar,
    eliminarUsuario
}) => {
    const isProf = tipoUsuario === 'profesores';
    const isAlum = tipoUsuario === 'alumnos';
    const colSpanProf = 10;
    const colSpanAlum = 11;

    if (cargando) {
        return <div className="tabla-loading">Cargando…</div>;
    }

    return (
        <div className="tabla-scroll">
            <table className="tabla">
                <thead>
                    <tr>
                        {isAlum && (
                            <th style={{ width: 32, textAlign: 'center' }}>
                                <input
                                    type="checkbox"
                                    checked={allFilteredSelected && allFilteredIds.length > 0}
                                    onChange={toggleSelectAllFiltered}
                                    title="Seleccionar todos (filtrados)"
                                />
                            </th>
                        )}
                        <th>Correo</th>
                        <th>Nombre</th>
                        <th>Apellido</th>
                        {isProf ? (
                            <>
                                <th>Tipo doc</th>
                                <th>RUT</th>
                                <th>Teléfono</th>
                                <th>Fecha creación</th>
                                <th>Año</th>
                                <th>Cargo</th>
                            </>
                        ) : (
                            <>
                                <th>Documento</th>
                                <th>Semestre</th>
                                <th>Jornada</th>
                                <th>Año</th>
                                <th>Teléfono</th>
                                <th>Riesgo</th>
                            </>
                        )}
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {usuarios.map((u) => {
                        const r = deriveRiesgo(u);
                        return (
                            <tr key={u._id}>
                                {isAlum && (
                                    <td style={{ textAlign: 'center' }}>
                                        <input type="checkbox" checked={seleccion.includes(u._id)} onChange={() => toggleSelect(u._id)} />
                                    </td>
                                )}
                                <td>{u.correo || '-'}</td>
                                <td>{u.nombre || '-'}</td>
                                <td>{getApellido(u) || '-'}</td>
                                {isProf ? (
                                    <>
                                        <td>{u.tipo_documento || '-'}</td>
                                        <td>{u.rut || '-'}</td>
                                        <td>{u.telefono || '-'}</td>
                                        <td>{getFechaCreacion(u) || '-'}</td>
                                        <td>{getAnio(u) || '-'}</td>
                                        <td>{u.cargo || '-'}</td>
                                    </>
                                ) : (
                                    <>
                                        <td>{u.numero_documento || '-'}</td>
                                        <td>{u.semestre ?? '-'}</td>
                                        <td>{u.jornada || '-'}</td>
                                        <td>{getAnio(u) || '-'}</td>
                                        <td>{u.telefono || '-'}</td>
                                        <td title={riesgoMensajeFE(r)}><RiesgoBadge value={r} /></td>
                                    </>
                                )}
                                <td>
                                    <button className="btn-edit" onClick={() => handleEditar(u)}>Editar</button>
                                    <button className="btn-sec" onClick={() => eliminarUsuario(u)} style={{ marginLeft: 8 }}>
                                        Eliminar
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                    {!usuarios.length && (
                        <tr>
                            <td colSpan={isProf ? colSpanProf : colSpanAlum}>Sin resultados.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default UsersTable;
