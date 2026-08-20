// src/pages/HistorialSemestres.jsx
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import API_BASE from "../services/apiConfig";
import "../styles/HistorialSemestres.css";

const CURRENT_YEAR = new Date().getFullYear();

function HistorialSemestres() {
  const [historiales, setHistoriales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: "", type: "" }); // type: "ok" | "err"

  // Archivar
  const [anio, setAnio] = useState(CURRENT_YEAR);
  const [semestre, setSemestre] = useState(1);
  const [archivando, setArchivando] = useState(false);

  // Modal detalle
  const [detalleAbierto, setDetalleAbierto] = useState(null); // historial completo o null
  const [cargandoDetalle, setCargandoDetalle] = useState(false);

  const token = localStorage.getItem("token") || "";
  const me = JSON.parse(localStorage.getItem("usuario") || "{}");
  const role = String(me?.rol || "").toLowerCase();
  const canDelete = role === "superadmin" || role === "admin";

  // ---- Cargar lista de historiales ----
  const cargarHistoriales = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_BASE}/historial-semestre`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHistoriales(Array.isArray(data) ? data : []);
    } catch {
      setHistoriales([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    cargarHistoriales();
  }, [cargarHistoriales]);

  // ---- Archivar semestre ----
  async function archivarSemestre() {
    const ordinal = Number(semestre) === 1 ? "1er" : "2do";
    const confirmar = window.confirm(
      `¿Archivar los alumnos del ${ordinal} Semestre ${anio}?\n\nSe guardará una copia de seguridad de todos los alumnos que coincidan con ese año y semestre.`
    );
    if (!confirmar) return;

    try {
      setArchivando(true);
      setMsg({ text: "", type: "" });

      const { data } = await axios.post(
        `${API_BASE}/historial-semestre/archivar`,
        { anio: Number(anio), semestre: Number(semestre) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMsg({
        text: data.msg || `Archivado: ${data.totalAlumnos} alumnos`,
        type: "ok",
      });
      cargarHistoriales();
    } catch (err) {
      setMsg({
        text: err?.response?.data?.msg || "Error al archivar",
        type: "err",
      });
    } finally {
      setArchivando(false);
    }
  }

  // ---- Descargar Excel ----
  async function descargarExcel(id, etiqueta) {
    try {
      const { data } = await axios.get(
        `${API_BASE}/historial-semestre/${id}/excel`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );
      const url = window.URL.createObjectURL(data);
      const link = document.createElement("a");
      link.href = url;
      link.download = `historial_${(etiqueta || "semestre").replace(/\s+/g, "_")}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setMsg({ text: "Error al descargar Excel", type: "err" });
    }
  }

  // ---- Ver detalle ----
  async function verDetalle(id) {
    try {
      setCargandoDetalle(true);
      const { data } = await axios.get(
        `${API_BASE}/historial-semestre/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDetalleAbierto(data);
    } catch {
      setMsg({ text: "Error al cargar detalle", type: "err" });
    } finally {
      setCargandoDetalle(false);
    }
  }

  // ---- Eliminar historial ----
  async function eliminarHistorial(id, etiqueta) {
    const confirmar = window.confirm(
      `¿Eliminar definitivamente el historial "${etiqueta}"?\n\nEsta acción no se puede deshacer.`
    );
    if (!confirmar) return;

    try {
      await axios.delete(`${API_BASE}/historial-semestre/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMsg({ text: `Historial "${etiqueta}" eliminado`, type: "ok" });
      cargarHistoriales();
    } catch (err) {
      setMsg({
        text: err?.response?.data?.msg || "Error al eliminar",
        type: "err",
      });
    }
  }

  // ---- Formatear fecha ----
  function fmtFecha(f) {
    if (!f) return "-";
    const d = new Date(f);
    return d.toLocaleDateString("es-CL", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
    });
  }

  // ---- Generar opciones de años ----
  const anioOptions = [];
  for (let y = CURRENT_YEAR + 1; y >= 2020; y--) {
    anioOptions.push(y);
  }

  return (
    <div className="historial-section">
      <h3>📚 Historial de Semestres</h3>

      {/* Sugerencia */}
      <div className="historial-sugerencia">
        <span className="historial-sugerencia-icon">💡</span>
        <span>
          <strong>Recomendación:</strong> Antes de subir un nuevo listado de alumnos, archiva
          el semestre actual para guardar una copia de seguridad que podrás descargar como
          Excel en cualquier momento.
        </span>
      </div>

      {/* Mensajes */}
      {msg.text && (
        <div className={msg.type === "ok" ? "historial-msg-ok" : "historial-msg-err"}>
          {msg.text}
        </div>
      )}

      {/* Barra de archivar */}
      <div className="historial-archivar">
        <label>
          Año:
          <select value={anio} onChange={(e) => setAnio(Number(e.target.value))}>
            {anioOptions.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </label>

        <label>
          Semestre:
          <select value={semestre} onChange={(e) => setSemestre(Number(e.target.value))}>
            <option value={1}>1er Semestre</option>
            <option value={2}>2do Semestre</option>
          </select>
        </label>

        <button
          className="historial-btn-archivar"
          onClick={archivarSemestre}
          disabled={archivando}
        >
          {archivando ? "Archivando…" : "📦 Archivar Semestre"}
        </button>
      </div>

      {/* Tabla de historiales */}
      <div className="historial-tabla-wrap">
        <table className="historial-tabla">
          <thead>
            <tr>
              <th>Etiqueta</th>
              <th>Año</th>
              <th>Semestre</th>
              <th>Alumnos</th>
              <th>Fecha Archivado</th>
              <th>Archivado por</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="historial-empty">Cargando…</td>
              </tr>
            ) : historiales.length === 0 ? (
              <tr>
                <td colSpan={7} className="historial-empty">
                  No hay semestres archivados aún.
                </td>
              </tr>
            ) : (
              historiales.map((h) => (
                <tr key={h._id}>
                  <td><strong>{h.etiqueta}</strong></td>
                  <td>{h.anio}</td>
                  <td>{h.semestre === 1 ? "1°" : "2°"}</td>
                  <td>{h.totalAlumnos}</td>
                  <td>{fmtFecha(h.fechaArchivado)}</td>
                  <td>{h.archivadoPorNombre || "-"}</td>
                  <td>
                    <div className="historial-acciones">
                      <button
                        className="historial-btn-excel"
                        onClick={() => descargarExcel(h._id, h.etiqueta)}
                        title="Descargar como Excel"
                      >
                        📥 Excel
                      </button>
                      <button
                        className="historial-btn-ver"
                        onClick={() => verDetalle(h._id)}
                        title="Ver detalle de alumnos"
                        disabled={cargandoDetalle}
                      >
                        👁 Ver
                      </button>
                      {canDelete && (
                        <button
                          className="historial-btn-eliminar"
                          onClick={() => eliminarHistorial(h._id, h.etiqueta)}
                          title="Eliminar historial"
                        >
                          🗑
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de detalle */}
      {detalleAbierto && (
        <div className="historial-modal-overlay" onClick={() => setDetalleAbierto(null)}>
          <div className="historial-modal" onClick={(e) => e.stopPropagation()}>
            <div className="historial-modal-header">
              <h4>
                📋 {detalleAbierto.etiqueta} — {detalleAbierto.totalAlumnos} alumnos
              </h4>
              <button
                className="historial-modal-close"
                onClick={() => setDetalleAbierto(null)}
                aria-label="Cerrar detalle"
              >
                ✕
              </button>
            </div>
            <div className="historial-modal-body">
              <table className="historial-detalle-tabla">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Correo</th>
                    <th>Nombre</th>
                    <th>Apellido</th>
                    <th>Documento</th>
                    <th>Teléfono</th>
                    <th>Jornada</th>
                    <th>Habilitado</th>
                    <th>Riesgo</th>
                    <th>Ingresos</th>
                  </tr>
                </thead>
                <tbody>
                  {(detalleAbierto.alumnos || []).map((a, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td>{a.correo}</td>
                      <td>{a.nombre}</td>
                      <td>{a.apellido}</td>
                      <td>{a.numero_documento}</td>
                      <td>{a.telefono}</td>
                      <td>{a.jornada || "-"}</td>
                      <td>{a.habilitado ? "Sí" : "No"}</td>
                      <td>{a.color_riesgo || "-"}</td>
                      <td>{a.conteo_ingresos ?? 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HistorialSemestres;
