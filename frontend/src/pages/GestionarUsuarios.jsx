import { useState } from 'react';
import { userService } from '../services/userService';
import { useUsuarios } from '../hooks/useUsuarios';
import { getApellido, getAnio, deriveRiesgo, getFechaCreacion } from '../utils/userHelpers';
import UserFilters from '../components/UserFilters';
import UsersTable from '../components/UsersTable';
import EditUserModal from '../components/EditUserModal';
import '../styles/GestionarUsuarios.css';

function GestionarUsuarios() {
  const {
    usuariosFiltrados,
    tipoUsuario,
    setTipoUsuario,
    cargando,
    error,
    obtenerUsuarios,
    eliminarUsuario,
    eliminarAlumnosSeleccionados,
    opcionesSemestre,
    opcionesAnio,
    filtros,
    seleccion
  } = useUsuarios();

  const [usuarioEditando, setUsuarioEditando] = useState(null);

  const usuarioActual = JSON.parse(localStorage.getItem('usuario') || '{}');
  const esSuper = String(usuarioActual?.rol || '').toLowerCase() === 'superadmin';
  const esAdmin = String(usuarioActual?.rol || '').toLowerCase() === 'admin';
  const permisosActual = Array.isArray(usuarioActual?.permisos) ? usuarioActual.permisos : [];
  const puedeEditarRiesgo = esSuper || esAdmin || permisosActual.includes('alertas:editar_riesgo');
  const puedeEliminarAlumnos = esSuper || esAdmin || permisosActual.includes('alumnos:eliminar');

  const handleEditar = (usuario) => {
    setUsuarioEditando(usuario);
  };

  const guardarCambios = async (formulario) => {
    try {
      const payload = { ...formulario };

      if (tipoUsuario === 'alumnos') {
        if (payload.semestre !== undefined && payload.semestre !== '') payload.semestre = Number(payload.semestre);
        if (payload.anio !== undefined && payload.anio !== '') payload.anio = Number(payload.anio);
      } else {
        delete payload.numero_documento; // no editar Nº doc en profesores
      }

      await userService.updateUsuario(tipoUsuario, formulario._id, payload);
      setUsuarioEditando(null);
      obtenerUsuarios();
    } catch (err) {
      console.error('❌ Error al actualizar usuario:', err);
      alert(err?.response?.data?.msg || 'No se pudo actualizar.');
    }
  };

  const exportarExcel = async () => {
    try {
      const XLSX = await import('xlsx');
      const esAlumnos = tipoUsuario === 'alumnos';

      const data = usuariosFiltrados.map(u => {
        const anio = getAnio(u);
        if (esAlumnos) {
          return {
            Correo: u.correo || '',
            Nombre: u.nombre || '',
            Apellido: getApellido(u) || '',
            Documento: u.numero_documento || '',
            Semestre: u.semestre ?? '',
            Jornada: u.jornada ?? '',
            Año: anio || '',
            Teléfono: u.telefono || '',
            Riesgo: deriveRiesgo(u).toUpperCase() || ''
          };
        } else {
          return {
            Correo: u.correo || '',
            Nombre: u.nombre || '',
            Apellido: getApellido(u) || '',
            'Tipo doc': u.tipo_documento || '',
            RUT: u.rut || '',
            Teléfono: u.telefono || '',
            'Fecha creación': getFechaCreacion(u) || '',
            Año: anio || '',
            Cargo: u.cargo || '',
            Rol: u.rol || ''
          };
        }
      });

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(wb, ws, esAlumnos ? 'Alumnos' : 'Profesores');

      const fecha = new Date().toISOString().slice(0, 10);
      const nombre = esAlumnos
        ? `alumnos_${filtros.jornada || 'todas'}_${filtros.semestre || 'todos'}_${filtros.anio || 'todos'}_${fecha}.xlsx`
        : `profesores_${filtros.anio || 'todos'}_${fecha}.xlsx`;

      XLSX.writeFile(wb, nombre);
    } catch (err) {
      console.error('Export Excel error:', err);
      alert('No se pudo exportar a Excel.');
    }
  };

  const limpiarFiltros = () => {
    filtros.setTexto('');
    filtros.setJornada('');
    filtros.setSemestre('');
    filtros.setAnio('');
    seleccion.setIds([]);
  };

  return (
    <div className="gestionar-usuarios">
      <h2>Gestionar Usuarios</h2>

      {error && <div className="alerta-error">{error}</div>}

      <div className="tipo-selector">
        <label>
          <input
            type="radio"
            name="tipo"
            value="alumnos"
            checked={tipoUsuario === 'alumnos'}
            onChange={() => setTipoUsuario('alumnos')}
          /> Alumnos
        </label>
        <label>
          <input
            type="radio"
            name="tipo"
            value="profesores"
            checked={tipoUsuario === 'profesores'}
            onChange={() => setTipoUsuario('profesores')}
          /> Profesores
        </label>
      </div>

      <UserFilters
        tipoUsuario={tipoUsuario}
        filtros={filtros}
        opcionesSemestre={opcionesSemestre}
        opcionesAnio={opcionesAnio}
        limpiarFiltros={limpiarFiltros}
        exportarExcel={exportarExcel}
        seleccion={seleccion}
        eliminarAlumnosSeleccionados={eliminarAlumnosSeleccionados}
        puedeEliminarAlumnos={puedeEliminarAlumnos}
      />

      <div className="tabla-contenedor">
        <UsersTable
          usuarios={usuariosFiltrados}
          tipoUsuario={tipoUsuario}
          cargando={cargando}
          seleccion={seleccion.ids}
          toggleSelect={seleccion.toggleSelect}
          toggleSelectAllFiltered={seleccion.toggleSelectAllFiltered}
          allFilteredSelected={seleccion.allFilteredSelected}
          allFilteredIds={seleccion.allFilteredIds}
          handleEditar={handleEditar}
          eliminarUsuario={eliminarUsuario}
        />
      </div>

      {/* ===== MODAL CENTRADO ===== */}
      {usuarioEditando && (
        <EditUserModal
          usuario={usuarioEditando}
          onClose={() => setUsuarioEditando(null)}
          onSave={guardarCambios}
          tipoUsuario={tipoUsuario}
          puedeEditarRiesgo={puedeEditarRiesgo}
        />
      )}
    </div>
  );
}

export default GestionarUsuarios;