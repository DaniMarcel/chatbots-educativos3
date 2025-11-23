import React from 'react';

export default function AlumnoProfile({ usuario, estadoCuentaTexto, riskClass, deudaLabel, riesgo }) {
    if (!usuario) return null;

    return (
        <div className="cards-grid">
            <section className="card">
                <h3 className="card-title">Información Personal</h3>
                <div className="kv-grid">
                    <div className="kv"><span className="k">Nombre</span><span className="v">{usuario.nombre} {usuario.apellido}</span></div>
                    <div className="kv"><span className="k">Documento</span><span className="v">{usuario.tipo_documento} {usuario.numero_documento}</span></div>
                    <div className="kv"><span className="k">Jornada</span><span className="v">{usuario.jornada}</span></div>
                    <div className="kv"><span className="k">Semestre</span><span className="v">{usuario.semestre}</span></div>
                </div>
            </section>

            <section className="card">
                <h3 className="card-title">Información de Contacto</h3>
                <div className="kv-grid">
                    <div className="kv"><span className="k">Correo</span><span className="v">{usuario.correo}</span></div>
                    <div className="kv"><span className="k">Teléfono</span><span className="v">{usuario.telefono || 'No registrado'}</span></div>
                </div>
            </section>

            <section className="card span-2">
                <h3 className="card-title">Información de deuda</h3>
                <div className="kv-grid">
                    <div className="kv">
                        <span className="k">Estado de cuenta</span>
                        <span className={`v ${estadoCuentaTexto === 'Suspendido' ? 'status-bad' : 'status-ok'}`}>{estadoCuentaTexto}</span>
                    </div>
                    <div className="kv">
                        <span className="k">{deudaLabel}</span>
                        <span className="v"><span className={riskClass}>{(riesgo || '—').toUpperCase()}</span></span>
                    </div>
                </div>
            </section>
        </div>
    );
}
