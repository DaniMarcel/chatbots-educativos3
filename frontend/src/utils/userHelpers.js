export const getApellido = (u) => u?.apellido ?? u?.apellidos ?? u?.lastName ?? u?.lastname ?? '';

/* === Catálogo de permisos para PROFESORES (para el editor) === */
export const PERMISOS = [
    {
        grupo: 'Datos del alumno', items: [
            { key: 'alumnos:editar_doc', label: 'Rut / DNI / Pasaporte' },
            { key: 'alumnos:editar_nombre', label: 'Nombre alumno' },
            { key: 'alumnos:editar_apellido', label: 'Apellido alumno' },
            { key: 'alumnos:editar_ano', label: 'Año' },
            { key: 'alumnos:editar_semestre', label: 'Semestre' },
            { key: 'alumnos:editar_jornada', label: 'Jornada' },
        ]
    },
    {
        grupo: 'Gestión académica', items: [
            { key: 'chatbots:autorizar_acceso', label: 'Autorizar / Desautorizar acceso a chatbots (individual/grupo)' },
            { key: 'alertas:editar_riesgo', label: 'Edición de alertas de riesgo' },
        ]
    },
    {
        grupo: 'Acciones administrativas', items: [
            { key: 'alumnos:eliminar', label: 'Eliminar alumno individual' },
            { key: 'chatbots:crear', label: 'Crear nuevos chatbots' },
            { key: 'chatbots:subir_material', label: 'Subir material a cada chatbot' },
            { key: 'alumnos:carga_masiva', label: 'Subir Excel con listado de alumnos' },
            { key: 'profesores:crear_editar', label: 'Crear / Editar profesores' },
        ]
    }
];
export const ALL_KEYS = PERMISOS.flatMap(g => g.items.map(i => i.key));


export const formatDate = (v) => {
    if (!v) return '';
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return '';
    return d.toISOString().slice(0, 10);
};

export const getFechaCreacion = (u) => formatDate(u?.fechaCreacion || u?.createdAt || u?.fecha_creacion);

export const getAnio = (u) => {
    if (u?.anio != null) return u.anio;
    const d = u?.fechaIngreso ? new Date(u.fechaIngreso)
        : u?.fechaCreacion ? new Date(u.fechaCreacion)
            : u?.createdAt ? new Date(u.createdAt) : null;
    return d && !Number.isNaN(d.getTime()) ? d.getFullYear() : '';
};

/* ========= Helpers de riesgo (para alumnos) ========= */
function calcRiesgoFE(vence) {
    if (!vence) return '';
    const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
    const end = new Date(vence); end.setHours(0, 0, 0, 0);
    if (Number.isNaN(end.getTime())) return '';
    const diff = Math.floor((end - hoy) / 86400000);
    if (diff < 0) return 'rojo';
    if (diff <= 10) return 'amarillo';
    return 'verde';
}

export function deriveRiesgo(a) {
    const r = (a?.riesgo ?? a?.color_riesgo ?? a?.riesgo_color ?? calcRiesgoFE(a?.suscripcionVenceEl) ?? '')
        .toString().toLowerCase();
    let rr = ['verde', 'amarillo', 'rojo'].includes(r) ? r : '';
    if (a?.habilitado === false) rr = 'rojo';
    return rr;
}

export function riesgoMensajeFE(r) {
    if (r === 'amarillo') return 'AMARILLO = suspensión en 10 días';
    if (r === 'rojo') return 'ROJO = suspendido, por favor pasar por secretaría';
    if (r === 'verde') return 'Suscripción activa';
    return '—';
}
