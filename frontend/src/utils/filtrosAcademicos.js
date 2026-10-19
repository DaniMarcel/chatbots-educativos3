export function normalizarAnio(valor) {
  const texto = String(valor ?? '').trim();
  return /^\d{4}$/.test(texto) && Number(texto) >= 2000 ? texto : '';
}

export function anioDe(alumno) {
  const anio = normalizarAnio(alumno?.anio);
  if (anio) return anio;
  if (!alumno?.fechaIngreso) return '';
  const fecha = new Date(alumno.fechaIngreso);
  return Number.isNaN(fecha.getTime()) ? '' : normalizarAnio(fecha.getUTCFullYear());
}

export function obtenerAniosAcademicos(valores = [], anioActual = new Date().getFullYear()) {
  // Mantener años futuros disponibles aunque aún no tengan alumnos.
  const sugeridos = Array.from({ length: 6 }, (_, i) => anioActual - 1 + i);
  return [...new Set([...sugeridos, ...valores].map(normalizarAnio).filter(Boolean))]
    .sort((a, b) => Number(b) - Number(a));
}

export function filtrarAlumnosAcademicos(alumnos, { anio = '', semestre = '', jornada = '' }) {
  return alumnos.filter((alumno) => (
    (!anio || anioDe(alumno) === String(anio)) &&
    (!semestre || String(alumno.semestre ?? '') === String(semestre)) &&
    (!jornada || String(alumno.jornada || '').trim() === jornada)
  ));
}
