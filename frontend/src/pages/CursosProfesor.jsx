import React, { useState } from "react";
import "../styles/CursosProfesor.css";
import useCursos from "../hooks/useCursos";
import CrearCursoModal from "../components/CrearCursoModal";
import GestionarCursoModal from "../components/GestionarCursoModal";

export default function CursosProfesor() {
  const {
    cursos, loading, chatbots, cats, catMap,
    fetchCursos, fetchChatbots, crearCurso, eliminarCurso, asignarChatbot, fetchCursoDetallado
  } = useCursos();

  // Popup de gestión
  const [cursoSel, setCursoSel] = useState(null);
  const [showGestionar, setShowGestionar] = useState(false);

  // Modal crear curso
  const [showCrear, setShowCrear] = useState(false);

  const handleGestionar = async (c) => {
    const curso = await fetchCursoDetallado(c._id);
    if (curso) {
      setCursoSel(curso);
      setShowGestionar(true);
    }
  };

  // Wrapper para actualizar el estado local cuando el modal hace cambios
  const refreshCursoSel = async (id) => {
    const updated = await fetchCursoDetallado(id);
    if (updated && cursoSel && cursoSel._id === updated._id) {
      setCursoSel(updated);
    }
    return updated;
  };

  const handleCrear = async (form) => {
    const success = await crearCurso(form);
    if (success) setShowCrear(false);
  };

  return (
    <div className="cp-page cp-compact">
      <div className="cp-topbar">
        <h3 className="cp-heading">Mis cursos</h3>
        <div className="cp-actions">
          <button className="btn btn-primary" onClick={() => setShowCrear(true)}>Nuevo curso</button>
          <button className="btn btn-primary" onClick={() => { fetchCursos(); fetchChatbots(); }}>
            Refrescar
          </button>
        </div>
      </div>

      <div className="cp-table-wrap">
        <table className="cp-table">
          <colgroup>
            <col className="cp-col-nameCourse" />
            <col className="cp-col-year" />
            <col className="cp-col-sem" />
            <col className="cp-col-jor" />
            <col className="cp-col-cat" />
            <col className="cp-col-cb" />
            <col className="cp-col-num" />
            <col className="cp-col-act" />
          </colgroup>
          <thead>
            <tr>
              <th>Curso</th>
              <th>Año</th>
              <th>Semestre</th>
              <th>Jornada</th>
              <th>Categoría</th>
              <th>Chatbot</th>
              <th>#</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="99">Cargando…</td></tr>
            ) : cursos.length ? (
              cursos.map((c) => {
                const cb = chatbots.find(b => (b._id || b.id) === c.chatbotId);
                return (
                  <tr key={c._id} title={c.nombre || ""}>
                    <td className="cp-ellipsis">{c.nombre || "—"}</td>
                    <td>{c.anio ?? "—"}</td>
                    <td>{c.semestre ?? "—"}</td>
                    <td>{c.jornada ?? "—"}</td>
                    {/* SOLO LECTURA */}
                    <td title={cb?.categoria || "—"}>{cb?.categoria || "—"}</td>
                    <td className="cp-ellipsis" title={cb?.nombre || "— Sin chatbot —"}>
                      {cb?.nombre || "— Sin chatbot —"}
                    </td>
                    <td style={{ textAlign: "center" }}>{Array.isArray(c.alumnos) ? c.alumnos.length : 0}</td>
                    <td className="cp-cell-actions">
                      <button
                        className="btn btn-primary"
                        onClick={() => handleGestionar(c)}
                      >
                        Gestionar
                      </button>
                      <button className="btn btn-danger" onClick={() => eliminarCurso(c._id)}>Eliminar</button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="99" className="cp-empty">
                  <div>Aún no tienes cursos.</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showGestionar && cursoSel && (
        <GestionarCursoModal
          curso={cursoSel}
          onClose={() => { setShowGestionar(false); setCursoSel(null); }}
          cats={cats}
          catMap={catMap}
          chatbots={chatbots}
          asignarChatbot={asignarChatbot}
          fetchCursoDetallado={refreshCursoSel}
        />
      )}

      {showCrear && (
        <CrearCursoModal
          onClose={() => setShowCrear(false)}
          onCreate={handleCrear}
        />
      )}
    </div>
  );
}