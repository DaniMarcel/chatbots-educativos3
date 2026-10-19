import { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import '../styles/VisitasRegistradas.css';
import { API_ROOT } from '../services/apiConfig';
import FiltrosAcademicos from '../components/FiltrosAcademicos';
import { anioDe, filtrarAlumnosAcademicos } from '../utils/filtrosAcademicos';

function formatDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function normalizeEmail(value = '') {
  return String(value || '').trim().toLowerCase();
}

function getAlumnoNombre(alumno) {
  return `${alumno?.nombre || ''} ${alumno?.apellido || alumno?.apellidos || ''}`.trim();
}

function getDocumento(alumno = {}) {
  const documento = alumno.numero_documento || alumno.rut || alumno.documento || '';
  const tipo = alumno.tipo_documento || (alumno.rut ? 'RUT' : 'Documento');
  return documento ? `${tipo} ${documento}` : '-';
}

function VisitasAlumnos() {
  const [actividad, setActividad] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [anio, setAnio] = useState('');
  const [semestre, setSemestre] = useState('');
  const [jornada, setJornada] = useState('');

  const fetchActividad = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token || ''}` };

      const [actividadRes, alumnosRes] = await Promise.all([
        axios.get(`${API_ROOT}/api/visitas/alumnos`, { headers }),
        axios.get(`${API_ROOT}/api/alumnos`, { headers }),
      ]);

      const actividadData = Array.isArray(actividadRes.data) ? actividadRes.data : [];
      const alumnosData = Array.isArray(alumnosRes.data) ? alumnosRes.data : [];

      const actividadPorCorreo = new Map(
        actividadData.map((item) => [normalizeEmail(item.correo), item])
      );

      const rows = alumnosData.map((alumno) => {
        const correo = normalizeEmail(alumno.correo);
        const actividadAlumno = actividadPorCorreo.get(correo);
        const ingresos = Number(
          actividadAlumno?.ingresosIA ??
          actividadAlumno?.visitas ??
          alumno.conteo_ingresos ??
          0
        );

        return {
          alumnoId: String(alumno._id || actividadAlumno?.alumnoId || correo),
          rutDni: actividadAlumno?.rutDni || getDocumento(alumno),
          nombre: getAlumnoNombre(alumno) || actividadAlumno?.nombre || '-',
          correo,
          anio: anioDe(alumno) || anioDe(actividadAlumno),
          semestre: alumno.semestre ?? actividadAlumno?.semestre ?? '',
          jornada: alumno.jornada || actividadAlumno?.jornada || '',
          ingresosIA: ingresos,
          ultimaVisita: actividadAlumno?.ultimaVisita || null,
        };
      });

      actividadData.forEach((item) => {
        const correo = normalizeEmail(item.correo);
        const exists = rows.some((row) => normalizeEmail(row.correo) === correo);
        if (!exists) {
          rows.push({
            alumnoId: item.alumnoId || correo,
            rutDni: item.rutDni || item.documento || '-',
            nombre: item.nombre || '-',
            correo,
            anio: anioDe(item),
            semestre: item.semestre || '',
            jornada: item.jornada || '',
            ingresosIA: Number(item.ingresosIA ?? item.visitas ?? 0),
            ultimaVisita: item.ultimaVisita || null,
          });
        }
      });

      rows.sort((a, b) => {
        const byLast = new Date(b.ultimaVisita || 0) - new Date(a.ultimaVisita || 0);
        return byLast || String(a.nombre).localeCompare(String(b.nombre), 'es');
      });

      setActividad(rows);
    } catch (err) {
      console.error('Error al obtener actividad de alumnos:', err);
      setError(err?.response?.data?.msg || 'No se pudo cargar la actividad de alumnos.');
      setActividad([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActividad();
  }, [fetchActividad]);

  const actividadFiltrada = useMemo(() => {
    return filtrarAlumnosAcademicos(actividad, { anio, semestre, jornada });
  }, [actividad, anio, semestre, jornada]);

  const totalIngresos = useMemo(() => {
    return actividadFiltrada.reduce((sum, alumno) => sum + Number(alumno.ingresosIA || 0), 0);
  }, [actividadFiltrada]);

  return (
    <div className="visitas-container actividad-alumnos">
      <div className="actividad-head">
        <div>
          <h2>Actividad de Alumnos</h2>
          <p>
            Revisa el uso real de la IA por alumno: total de ingresos y última fecha registrada.
            {' '}Los filtros seleccionan alumnos por su año de ingreso, semestre y jornada.
          </p>
        </div>
        <button className="descargar-btn" onClick={fetchActividad} disabled={loading}>
          {loading ? 'Actualizando...' : 'Refrescar alumnos'}
        </button>
      </div>

      <div className="actividad-resumen">
        <div className="resumen-item">
          <span>Resultados</span>
          <strong>{actividadFiltrada.length}</strong>
        </div>
        <div className="resumen-item">
          <span>Ingresos totales</span>
          <strong>{totalIngresos}</strong>
        </div>
        <FiltrosAcademicos
          anio={anio} semestre={semestre} jornada={jornada}
          onAnioChange={setAnio} onSemestreChange={setSemestre} onJornadaChange={setJornada}
          aniosDisponibles={actividad.map(anioDe)}
          jornadasDisponibles={actividad.map((alumno) => alumno.jornada)}
        />
      </div>

      {error && <div className="visitas-error">{error}</div>}

      <div className="tabla-scroll actividad-scroll">
        <table className="tabla-visitas actividad-table">
          <thead>
            <tr>
              <th>RUT/DNI</th>
              <th>Nombre</th>
              <th>Año</th>
              <th>Semestre</th>
              <th>Jornada</th>
              <th>Ingresos a la IA</th>
              <th>Último ingreso</th>
            </tr>
          </thead>
          <tbody>
            {actividadFiltrada.map((alumno) => (
              <tr key={alumno.alumnoId || alumno.correo}>
                <td>{alumno.rutDni || alumno.documento || '-'}</td>
                <td>
                  <strong>{alumno.nombre || '-'}</strong>
                  {alumno.correo && <span className="td-sub">{alumno.correo}</span>}
                </td>
                <td>{alumno.anio || '-'}</td>
                <td>{alumno.semestre || '-'}</td>
                <td>{alumno.jornada || '-'}</td>
                <td>
                  <span className={Number(alumno.ingresosIA || 0) > 0 ? 'metric-pill' : 'metric-pill is-zero'}>
                    {Number(alumno.ingresosIA || 0)}
                  </span>
                </td>
                <td>{formatDate(alumno.ultimaVisita)}</td>
              </tr>
            ))}

            {!loading && !actividadFiltrada.length && (
              <tr>
                <td colSpan={7} className="empty-cell">
                  No hay alumnos para mostrar con este filtro.
                </td>
              </tr>
            )}

            {loading && (
              <tr>
                <td colSpan={7} className="empty-cell">
                  Cargando actividad...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default VisitasAlumnos;
