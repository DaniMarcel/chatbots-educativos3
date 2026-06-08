import { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import '../styles/VisitasRegistradas.css';
import { API_ROOT } from '../services/apiConfig';

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

function VisitasAlumnos() {
  const [actividad, setActividad] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [jornada, setJornada] = useState('');

  const fetchActividad = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_ROOT}/api/visitas/alumnos`, {
        headers: { Authorization: `Bearer ${token || ''}` },
      });
      setActividad(Array.isArray(res.data) ? res.data : []);
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

  const jornadas = useMemo(() => {
    return Array.from(new Set(
      actividad.map((alumno) => String(alumno.jornada || '').trim()).filter(Boolean)
    )).sort((a, b) => a.localeCompare(b, 'es'));
  }, [actividad]);

  const actividadFiltrada = useMemo(() => {
    if (!jornada) return actividad;
    return actividad.filter((alumno) => String(alumno.jornada || '') === jornada);
  }, [actividad, jornada]);

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
        <label className="actividad-filter">
          <span>Jornada</span>
          <select value={jornada} onChange={(e) => setJornada(e.target.value)}>
            <option value="">Todas las jornadas</option>
            {jornadas.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </label>
      </div>

      {error && <div className="visitas-error">{error}</div>}

      <div className="tabla-scroll actividad-scroll">
        <table className="tabla-visitas actividad-table">
          <thead>
            <tr>
              <th>RUT/DNI</th>
              <th>Nombre</th>
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
                <td colSpan={6} className="empty-cell">
                  No hay alumnos para mostrar con este filtro.
                </td>
              </tr>
            )}

            {loading && (
              <tr>
                <td colSpan={6} className="empty-cell">
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
