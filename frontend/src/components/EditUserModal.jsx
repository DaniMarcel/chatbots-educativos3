import React, { useState, useEffect, useMemo } from 'react';
import { getApellido, formatDate, PERMISOS, ALL_KEYS, deriveRiesgo, riesgoMensajeFE } from '../utils/userHelpers';

const JORNADAS = ['Mañana', 'Tarde', 'Vespertino', 'Viernes', 'Sábados'];

const EditUserModal = ({ usuario, onClose, onSave, tipoUsuario, puedeEditarRiesgo }) => {
    const isProf = tipoUsuario === 'profesores';
    const [formulario, setFormulario] = useState({});

    useEffect(() => {
        if (usuario) {
            const ap = getApellido(usuario);
            setFormulario({
                ...usuario,
                apellido: ap,
                apellidos: ap,
                permisos: Array.isArray(usuario.permisos) ? usuario.permisos : []
            });
        }
    }, [usuario]);

    /* 👉 Bloquea el scroll del body cuando el modal está abierto */
    useEffect(() => {
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = prev; };
    }, []);

    const handleFormularioChange = (e) => {
        const { name, value } = e.target;
        const next = { ...formulario, [name]: value };
        if (name === 'apellido' || name === 'apellidos') {
            next.apellido = value;
            next.apellidos = value;
        }
        setFormulario(next);
    };

    const togglePerm = (key) => {
        setFormulario((prev) => {
            const cur = Array.isArray(prev.permisos) ? prev.permisos : [];
            const next = cur.includes(key) ? cur.filter(k => k !== key) : [...cur, key];
            return { ...prev, permisos: next };
        });
    };

    const allSelected = useMemo(
        () => (Array.isArray(formulario.permisos) ? formulario.permisos.length === ALL_KEYS.length : false),
        [formulario.permisos]
    );

    const toggleAll = () => setFormulario(prev => ({ ...prev, permisos: allSelected ? [] : [...ALL_KEYS] }));

    const handleSave = () => {
        onSave(formulario);
    };

    return (
        <div
            className="gu-modal"
            role="dialog"
            aria-modal="true"
            onMouseDown={onClose} /* click fuera cierra */
        >
            <div
                className="gu-dialog"
                onMouseDown={(e) => e.stopPropagation()}    /* evita cerrar al clickear dentro */
            >
                <div className="gu-header">
                    <h3 className="gu-title">Editar {isProf ? 'Profesor' : 'Alumno'}</h3>
                    <button className="gu-close" onClick={onClose} aria-label="Cerrar">✕</button>
                </div>

                {/* Campos comunes */}
                <input name="correo" value={formulario.correo || ''} onChange={handleFormularioChange} placeholder="Correo" />
                <input name="nombre" value={formulario.nombre || ''} onChange={handleFormularioChange} placeholder="Nombre" />
                <input name="apellido" value={formulario.apellido || ''} onChange={handleFormularioChange} placeholder="Apellido" />

                {isProf ? (
                    <>
                        <select name="tipo_documento" value={formulario.tipo_documento || ''} onChange={handleFormularioChange}>
                            <option value="">Tipo de documento</option>
                            <option value="RUT">RUT</option>
                            <option value="DNI">DNI</option>
                            <option value="Pasaporte">Pasaporte</option>
                        </select>
                        <input name="rut" value={formulario.rut || ''} onChange={handleFormularioChange} placeholder="RUT" />
                        <input name="telefono" value={formulario.telefono || ''} onChange={handleFormularioChange} placeholder="Teléfono" />
                        <input
                            type="date"
                            name="fechaCreacion"
                            value={formatDate(formulario.fechaCreacion || formulario.createdAt) || ''}
                            onChange={handleFormularioChange}
                            placeholder="Fecha de creación"
                        />
                        <input name="cargo" value={formulario.cargo || ''} onChange={handleFormularioChange} placeholder="Cargo" />

                        {/* Permisos profesor */}
                        <div className="perm-wrap">
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                                <strong>Permisos</strong>
                                <button type="button" className="btn-ghost" onClick={toggleAll}>
                                    {allSelected ? 'Quitar todos' : 'Seleccionar todos'}
                                </button>
                            </div>
                            {PERMISOS.map((g) => (
                                <fieldset key={g.grupo} className="perm-group">
                                    <legend>{g.grupo}</legend>
                                    <div className="perm-grid">
                                        {g.items.map((p) => {
                                            const checked = Array.isArray(formulario.permisos) && formulario.permisos.includes(p.key);
                                            return (
                                                <label key={p.key} className="perm-item">
                                                    <input type="checkbox" checked={!!checked} onChange={() => togglePerm(p.key)} />
                                                    <span>{p.label}</span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </fieldset>
                            ))}
                        </div>
                    </>
                ) : (
                    <>
                        {/* Alumnos */}
                        <input name="numero_documento" value={formulario.numero_documento || ''} onChange={handleFormularioChange} placeholder="Número de documento" />
                        <select name="semestre" value={String(formulario.semestre ?? '')} onChange={handleFormularioChange}>
                            <option value="">Semestre</option>
                            <option value="1">1</option>
                            <option value="2">2</option>
                        </select>
                        <select name="jornada" value={formulario.jornada || ''} onChange={handleFormularioChange}>
                            <option value="">Jornada</option>
                            {JORNADAS.map(j => <option key={j} value={j}>{j}</option>)}
                        </select>
                        <input name="telefono" value={formulario.telefono || ''} onChange={handleFormularioChange} placeholder="Teléfono" />

                        {puedeEditarRiesgo && (
                            <>
                                <label style={{ display: 'block', marginTop: 8 }}>
                                    <span style={{ display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Color de riesgo</span>
                                    <select name="riesgo" value={formulario.riesgo || ''} onChange={handleFormularioChange}>
                                        <option value="">Riesgo (sin definir)</option>
                                        <option value="verde">Verde</option>
                                        <option value="amarillo">Amarillo</option>
                                        <option value="rojo">Rojo</option>
                                    </select>
                                </label>
                                <div style={{ marginTop: 8 }}>
                                    {(() => {
                                        const r = (formulario.riesgo || deriveRiesgo(formulario) || '').toLowerCase();
                                        const bg = r === 'verde' ? '#27ae60' : r === 'amarillo' ? '#f1c40f' : r === 'rojo' ? '#c0392b' : '#95a5a6';
                                        return (
                                            <>
                                                <div style={{ display: 'inline-block', padding: '4px 10px', borderRadius: 999, background: bg, color: '#fff', fontWeight: 700, marginRight: 8 }}>
                                                    {(r || '—').toString().toUpperCase()}
                                                </div>
                                                <small style={{ opacity: 0.8 }}>{riesgoMensajeFE(r)}</small>
                                            </>
                                        );
                                    })()}
                                </div>
                            </>
                        )}
                    </>
                )}

                <div className="gu-actions">
                    <button className="btn-prim" onClick={handleSave}>Guardar</button>
                    <button className="btn-sec" onClick={onClose}>Cancelar</button>
                </div>
            </div>
        </div>
    );
};

export default EditUserModal;
