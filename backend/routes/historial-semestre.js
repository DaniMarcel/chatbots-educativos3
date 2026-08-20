// routes/historial-semestre.js
const express = require('express');
const ExcelJS = require('exceljs');
const Alumno = require('../models/Alumno');
const HistorialSemestre = require('../models/HistorialSemestre');
const { verificarToken, autorizarRoles } = require('../middlewares/auth');

const router = express.Router();

// Campos que se copian al snapshot
const SNAPSHOT_FIELDS = [
  'correo', 'nombre', 'apellido', 'tipo_documento', 'numero_documento',
  'rut', 'telefono', 'semestre', 'jornada', 'anio', 'fechaIngreso',
  'habilitado', 'color_riesgo', 'conteo_ingresos', 'rol', 'createdAt',
];

function buildSnapshot(alumno) {
  const snap = {};
  for (const k of SNAPSHOT_FIELDS) {
    if (alumno[k] !== undefined) snap[k] = alumno[k];
  }
  return snap;
}

// =============================================
// POST /api/historial-semestre/archivar
// Body: { anio: 2026, semestre: 1 }
// Guarda un snapshot de todos los alumnos que
// coincidan con ese año/semestre.
// =============================================
router.post(
  '/archivar',
  verificarToken,
  autorizarRoles('profesor', 'admin', 'superadmin'),
  async (req, res) => {
    try {
      const { anio, semestre } = req.body;

      // Validar
      const anioNum = Number(anio);
      const semNum = Number(semestre);
      if (!anioNum || anioNum < 2000 || anioNum > 9999) {
        return res.status(400).json({ msg: 'Año inválido (2000-9999)' });
      }
      if (semNum !== 1 && semNum !== 2) {
        return res.status(400).json({ msg: 'Semestre debe ser 1 o 2' });
      }

      // Construir filtro según rol
      const rol = String(req.usuario?.rol || '').toLowerCase();
      const me = String(req.usuario?.id || '');
      const filter = { anio: anioNum, semestre: semNum };
      if (rol === 'profesor') {
        filter.createdBy = me;
      }

      // Obtener alumnos
      const alumnos = await Alumno.find(filter, '-contrasena -__v').lean();
      if (!alumnos.length) {
        return res.status(404).json({
          msg: `No se encontraron alumnos para ${semNum === 1 ? '1er' : '2do'} semestre ${anioNum}`,
        });
      }

      // Crear snapshot
      const ordinal = semNum === 1 ? '1er' : '2do';
      const etiqueta = `${ordinal} Semestre ${anioNum}`;

      const historial = new HistorialSemestre({
        anio: anioNum,
        semestre: semNum,
        etiqueta,
        fechaArchivado: new Date(),
        archivadoPor: me,
        archivadoPorNombre: req.usuario?.nombre || req.usuario?.correo || '',
        totalAlumnos: alumnos.length,
        alumnos: alumnos.map(buildSnapshot),
      });

      await historial.save();

      res.json({
        ok: true,
        msg: `Archivado exitoso: ${alumnos.length} alumnos del ${etiqueta}`,
        id: historial._id,
        etiqueta,
        totalAlumnos: alumnos.length,
        fechaArchivado: historial.fechaArchivado,
      });
    } catch (err) {
      console.error('[historial-semestre] archivar error:', err);
      res.status(500).json({ msg: 'Error al archivar semestre' });
    }
  }
);

// =============================================
// GET /api/historial-semestre
// Lista todos los historiales (solo metadata,
// sin embeber los alumnos para rendimiento).
// =============================================
router.get(
  '/',
  verificarToken,
  autorizarRoles('profesor', 'admin', 'superadmin'),
  async (req, res) => {
    try {
      const rol = String(req.usuario?.rol || '').toLowerCase();
      const me = String(req.usuario?.id || '');
      const filter = rol === 'profesor' ? { archivadoPor: me } : {};

      const historiales = await HistorialSemestre
        .find(filter, '-alumnos')           // excluir array de alumnos
        .sort({ fechaArchivado: -1 })
        .lean();

      res.json(historiales);
    } catch (err) {
      console.error('[historial-semestre] listar error:', err);
      res.status(500).json({ msg: 'Error al listar historiales' });
    }
  }
);

// =============================================
// GET /api/historial-semestre/:id
// Detalle completo de un historial (con alumnos)
// =============================================
router.get(
  '/:id',
  verificarToken,
  autorizarRoles('profesor', 'admin', 'superadmin'),
  async (req, res) => {
    try {
      const historial = await HistorialSemestre.findById(req.params.id).lean();
      if (!historial) {
        return res.status(404).json({ msg: 'Historial no encontrado' });
      }

      // Profesor solo ve los suyos
      const rol = String(req.usuario?.rol || '').toLowerCase();
      const me = String(req.usuario?.id || '');
      if (rol === 'profesor' && String(historial.archivadoPor) !== me) {
        return res.status(403).json({ msg: 'No autorizado' });
      }

      res.json(historial);
    } catch (err) {
      console.error('[historial-semestre] detalle error:', err);
      res.status(500).json({ msg: 'Error al obtener historial' });
    }
  }
);

// =============================================
// GET /api/historial-semestre/:id/excel
// Genera y descarga archivo .xlsx
// =============================================
router.get(
  '/:id/excel',
  verificarToken,
  autorizarRoles('profesor', 'admin', 'superadmin'),
  async (req, res) => {
    try {
      const historial = await HistorialSemestre.findById(req.params.id).lean();
      if (!historial) {
        return res.status(404).json({ msg: 'Historial no encontrado' });
      }

      // Profesor solo descarga los suyos
      const rol = String(req.usuario?.rol || '').toLowerCase();
      const me = String(req.usuario?.id || '');
      if (rol === 'profesor' && String(historial.archivadoPor) !== me) {
        return res.status(403).json({ msg: 'No autorizado' });
      }

      // Construir Excel con ExcelJS
      const wb = new ExcelJS.Workbook();
      wb.creator = 'Chatbots Educativos';
      wb.created = new Date();

      const ws = wb.addWorksheet(historial.etiqueta || 'Alumnos');

      // Encabezados
      ws.columns = [
        { header: 'Correo',           key: 'correo',           width: 30 },
        { header: 'Nombre',           key: 'nombre',           width: 18 },
        { header: 'Apellido',         key: 'apellido',         width: 18 },
        { header: 'Tipo Documento',   key: 'tipo_documento',   width: 16 },
        { header: 'Nro Documento',    key: 'numero_documento', width: 18 },
        { header: 'Teléfono',         key: 'telefono',         width: 16 },
        { header: 'Semestre',         key: 'semestre',         width: 10 },
        { header: 'Jornada',          key: 'jornada',          width: 14 },
        { header: 'Año',              key: 'anio',             width: 8 },
        { header: 'Fecha Ingreso',    key: 'fechaIngreso',     width: 14 },
        { header: 'Habilitado',       key: 'habilitado',       width: 12 },
        { header: 'Color Riesgo',     key: 'color_riesgo',     width: 14 },
        { header: 'Ingresos',         key: 'conteo_ingresos',  width: 10 },
        { header: 'Creado',           key: 'createdAt',        width: 14 },
      ];

      // Estilo de encabezado
      ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      ws.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF005D8C' },
      };
      ws.getRow(1).alignment = { horizontal: 'center' };

      // Agregar filas
      for (const a of historial.alumnos) {
        ws.addRow({
          correo: a.correo || '',
          nombre: a.nombre || '',
          apellido: a.apellido || '',
          tipo_documento: a.tipo_documento || '',
          numero_documento: a.numero_documento || '',
          telefono: a.telefono || '',
          semestre: a.semestre ?? '',
          jornada: a.jornada || '',
          anio: a.anio ?? '',
          fechaIngreso: a.fechaIngreso
            ? new Date(a.fechaIngreso).toISOString().slice(0, 10)
            : '',
          habilitado: a.habilitado ? 'Sí' : 'No',
          color_riesgo: a.color_riesgo || '',
          conteo_ingresos: a.conteo_ingresos ?? 0,
          createdAt: a.createdAt
            ? new Date(a.createdAt).toISOString().slice(0, 10)
            : '',
        });
      }

      // Nombre del archivo
      const nombreArchivo = `historial_${historial.etiqueta.replace(/\s+/g, '_')}.xlsx`;

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${nombreArchivo}"`);

      await wb.xlsx.write(res);
      res.end();
    } catch (err) {
      console.error('[historial-semestre] excel error:', err);
      res.status(500).json({ msg: 'Error al generar Excel' });
    }
  }
);

// =============================================
// DELETE /api/historial-semestre/:id
// Solo admin/superadmin pueden eliminar historiales
// =============================================
router.delete(
  '/:id',
  verificarToken,
  autorizarRoles('admin', 'superadmin'),
  async (req, res) => {
    try {
      const historial = await HistorialSemestre.findByIdAndDelete(req.params.id);
      if (!historial) {
        return res.status(404).json({ msg: 'Historial no encontrado' });
      }
      res.json({ ok: true, msg: `Historial "${historial.etiqueta}" eliminado` });
    } catch (err) {
      console.error('[historial-semestre] eliminar error:', err);
      res.status(500).json({ msg: 'Error al eliminar historial' });
    }
  }
);

module.exports = router;
