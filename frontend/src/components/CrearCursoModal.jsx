import React, { useState, useEffect } from 'react';
import { JORNADAS } from '../utils/userHelpers';

export default function CrearCursoModal({ onClose, onCreate }) {
    const [form, setForm] = useState({ nombre: "", descripcion: "", anio: "", semestre: "", jornada: "" });

    useEffect(() => {
        document.body.classList.add("cp-no-scroll");
        return () => document.body.classList.remove("cp-no-scroll");
    }, []);

    const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
    const onAnioChange = (e) => { const v = e.target.value; if (/^\d{0,4}$/.test(v)) set("anio", v); };

    const ok = form.nombre.trim().length > 0 &&
        (!form.anio || /^\d{4}$/.test(form.anio)) &&
        (!form.semestre || ["1", "2"].includes(String(form.semestre))) &&
        (!form.jornada || JORNADAS.includes(form.jornada));

    return (
        <div className="cp-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }} role="dialog" aria-modal="true">
            <div className="cp-modal" onMouseDown={(e) => e.stopPropagation()}>
                <div className="cp-header">
                    <h4 className="cp-title">Crear un curso</h4>
                </div>

                <div className="cp-content">
                    <div className="cp-form">
                        <label className="cp-field cp-col-6">
                            <span>Nombre</span>
                            <input className="cp-input" value={form.nombre}
                                onChange={(e) => set("nombre", e.target.value)} placeholder="Ej: Matemática I" />
                        </label>

                        <label className="cp-field cp-col-6">
                            <span>Descripción</span>
                            <textarea className="cp-textarea" rows={3}
                                value={form.descripcion} onChange={(e) => set("descripcion", e.target.value)}
                                placeholder="Opcional" />
                        </label>

                        <label className="cp-field cp-col-3">
                            <span>Año</span>
                            <input className="cp-input" inputMode="numeric" maxLength={4}
                                placeholder="2025" value={form.anio} onChange={onAnioChange} />
                        </label>

                        <label className="cp-field cp-col-3">
                            <span>Semestre</span>
                            <select className="cp-select" value={form.semestre} onChange={(e) => set("semestre", e.target.value)}>
                                <option value="">— Seleccionar —</option>
                                <option value="1">1</option><option value="2">2</option>
                            </select>
                        </label>

                        <label className="cp-field cp-col-6">
                            <span>Jornada</span>
                            <select className="cp-select" value={form.jornada} onChange={(e) => set("jornada", e.target.value)}>
                                <option value="">— Seleccionar —</option>
                                {JORNADAS.map((j) => <option key={j} value={j}>{j}</option>)}
                            </select>
                        </label>
                    </div>
                </div>

                <div className="cp-footer">
                    <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
                    <button className="btn btn-primary" onClick={() => onCreate(form)} disabled={!ok}
                        title={!ok ? "Completa los campos requeridos correctamente" : "Crear"}>
                        Crear
                    </button>
                </div>
            </div>
        </div>
    );
}
