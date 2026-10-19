import { useEffect, useId, useState } from 'react';
import courseService from '../services/courseService';
import { JORNADAS } from '../utils/userHelpers';
import { normalizarAnio, obtenerAniosAcademicos } from '../utils/filtrosAcademicos';
import '../styles/FiltrosAcademicos.css';

export default function FiltrosAcademicos({
  anio, semestre, jornada, onAnioChange, onSemestreChange, onJornadaChange,
  aniosDisponibles = [], jornadasDisponibles = [],
}) {
  const id = useId();
  const [guardados, setGuardados] = useState([]);
  const [agregando, setAgregando] = useState(false);
  const [nuevoAnio, setNuevoAnio] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let activo = true;
    courseService.getAniosAcademicos()
      .then((data) => {
        if (activo) setGuardados((actuales) => [...new Set([...actuales, ...(Array.isArray(data) ? data : [])])]);
      })
      .catch(() => { if (activo) setError('No se pudieron cargar los años guardados. Puedes seguir usando los filtros.'); });
    return () => { activo = false; };
  }, []);

  const anios = obtenerAniosAcademicos([...aniosDisponibles, ...guardados, anio]);
  const jornadas = [...new Set([...JORNADAS, ...jornadasDisponibles, jornada]
    .map((valor) => String(valor || '').trim()).filter(Boolean))];

  const agregarAnio = async (event) => {
    event.preventDefault();
    const valor = normalizarAnio(nuevoAnio);
    if (!valor) {
      setError('Ingresa un año válido entre 2000 y 9999.');
      return;
    }
    setGuardando(true);
    setError('');
    try {
      const data = await courseService.agregarAnioAcademico(Number(valor));
      setGuardados(Array.isArray(data) ? data : [valor]);
      onAnioChange(valor);
      setAgregando(false);
      setNuevoAnio('');
    } catch (err) {
      setError(err?.response?.data?.msg || 'No se pudo guardar el año. Inténtalo nuevamente.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="filtros-academicos" role="group" aria-label="Filtros de alumnos">
      <div className="fa-controles">
        <label className="fa-campo">
          <span>Año</span>
          <select value={anio} onChange={(e) => onAnioChange(e.target.value)}>
            <option value="">Todos los años</option>
            {anios.map((valor) => <option key={valor} value={valor}>{valor}</option>)}
          </select>
        </label>
        <button type="button" className="fa-boton" aria-expanded={agregando} aria-controls={`${id}-agregar`}
          onClick={() => setAgregando((valor) => !valor)} disabled={guardando}>
          Agregar año
        </button>
        <label className="fa-campo">
          <span>Semestre</span>
          <select value={semestre} onChange={(e) => onSemestreChange(e.target.value)}>
            <option value="">Ambos semestres</option>
            <option value="1">1er Semestre</option>
            <option value="2">2do Semestre</option>
          </select>
        </label>
        <label className="fa-campo">
          <span>Jornada</span>
          <select value={jornada} onChange={(e) => onJornadaChange(e.target.value)}>
            <option value="">Todas las jornadas</option>
            {jornadas.map((valor) => <option key={valor} value={valor}>{valor}</option>)}
          </select>
        </label>
      </div>
      {agregando && (
        <form className="fa-agregar" id={`${id}-agregar`} onSubmit={agregarAnio}>
          <label className="fa-campo">
            <span>Nuevo año</span>
            <input type="number" min="2000" max="9999" step="1" required autoFocus
              placeholder="Ej: 2031" value={nuevoAnio} disabled={guardando}
              onChange={(e) => setNuevoAnio(e.target.value)} />
          </label>
          <button type="submit" className="fa-boton fa-guardar" disabled={guardando}>
            {guardando ? 'Guardando...' : 'Guardar año'}
          </button>
          <button type="button" className="fa-boton" disabled={guardando} onClick={() => setAgregando(false)}>
            Cancelar
          </button>
        </form>
      )}
      {error && <p className="fa-error" role="alert">{error}</p>}
    </div>
  );
}
