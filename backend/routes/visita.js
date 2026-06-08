// routes/visitas.js
const express = require('express');
const router = express.Router();
const Visita = require('../models/Visita');
const Alumno = require('../models/Alumno');
const { verificarToken, autorizarRoles } = require('../middlewares/auth');
const { Parser } = require('json2csv');
const ExcelJS = require('exceljs');

/* ========= Registrar visita (Público) ========= */
router.post('/registro', async (req, res) => {
  console.log('👉 Datos recibidos en visita:', req.body);

  const { nombre, correo, whatsapp } = req.body;

  if (!nombre || !correo || !whatsapp) {
    console.log('❌ Faltan campos obligatorios');
    return res.status(400).json({ msg: 'Todos los campos son obligatorios' });
  }

  // Verificar si hay un token de autenticación y si el usuario es un alumno
  const token = req.headers.authorization?.split(' ')[1]; // Extraer token del header
  if (token) {
    try {
      const decoded = require('jsonwebtoken').verify(token, process.env.JWT_SECRET); // Decodificar token
      console.log('🔍 Token decodificado, rol:', decoded.rol);
      if (decoded.rol === 'alumno') {
        console.log('✅ Usuario alumno autenticado, no se registra visita externa');
        return res.json({ msg: 'Visita no registrada para usuarios internos' });
      }
    } catch (err) {
      console.log('❌ Token inválido, tratando como visita externa XD');
    }
  } else {
    console.log('ℹ️ No hay token en la solicitud');
  }

  // Verificar si el correo pertenece a un alumno registrado
  console.log('🔍 Verificando si correo pertenece a alumno:', correo);
  try {
    const alumnoExistente = await Alumno.findOne({ correo });
    console.log('🔍 Resultado de findOne para alumno:', alumnoExistente ? 'Encontrado' : 'No encontrado');
    if (alumnoExistente) {
      console.log('✅ Correo pertenece a un alumno registrado, no se registra visita externa');
      return res.status(409).json({ msg: 'El correo ya está registrado como alumno.' });
    }
  } catch (err) {
    console.error('❌ Error al verificar alumno:', err);
    // Continuar si hay error, para no bloquear
  }

  try {
    const nuevaVisita = new Visita({ nombre, correo, whatsapp });
    await nuevaVisita.save();
    console.log('✅ Visita registrada correctamente');
    res.json({ msg: 'Visita registrada correctamente' });
  } catch (err) {
    console.error('❌ Error completo al registrar visita:', err);
    res.status(500).json({ msg: 'Error al registrar visita' });
  }
});

/* ========= Exportar TODAS las visitas como XLSX (Solo Superadmin) ========= */
router.get('/exportar', verificarToken, autorizarRoles('superadmin'), async (req, res) => {
  try {
    const visitas = await Visita.aggregate([
      {
        $match: { rol: 'invitado' } // Filtrar solo visitas de invitados
      },
      {
        $group: {
          _id: '$correo',
          nombre: { $first: '$nombre' },
          whatsapp: { $first: '$whatsapp' },
          visitas: { $sum: 1 },
          ultimaVisita: { $max: '$fechaHora' },
        },
      },
      { $sort: { ultimaVisita: -1 } },
      {
        $project: {
          _id: 0,
          correo: '$_id',
          nombre: 1,
          whatsapp: 1,
          visitas: 1,
          ultimaVisita: 1,
        },
      },
    ]);

    const wb = new ExcelJS.Workbook();
    wb.creator = 'Chatbots Educativos';
    wb.created = new Date();
    const ws = wb.addWorksheet('Visitas');

    ws.columns = [
      { header: 'Nombre', key: 'nombre', width: 28 },
      { header: 'Correo', key: 'correo', width: 34 },
      { header: 'WhatsApp', key: 'whatsapp', width: 18 },
      { header: 'N° de Visitas', key: 'visitas', width: 15 },
      { header: 'Última Visita', key: 'ultimaVisita', width: 22 },
    ];
    ws.getRow(1).font = { bold: true };

    visitas.forEach((v) => {
      ws.addRow({
        nombre: v.nombre || '',
        correo: v.correo || '',
        whatsapp: v.whatsapp || '',
        visitas: v.visitas || 0,
        ultimaVisita: v.ultimaVisita ? new Date(v.ultimaVisita) : '',
      });
    });

    ws.getColumn('ultimaVisita').numFmt = 'dd/mm/yyyy hh:mm';
    ws.eachRow((row) => {
      row.alignment = { vertical: 'middle', wrapText: false };
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFDDDDDD' } },
          left: { style: 'thin', color: { argb: 'FFDDDDDD' } },
          bottom: { style: 'thin', color: { argb: 'FFDDDDDD' } },
          right: { style: 'thin', color: { argb: 'FFDDDDDD' } },
        };
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="visitas_totales.xlsx"');
    await wb.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error('❌ Error al exportar todas las visitas (xlsx):', err);
    res.status(500).json({ msg: 'Error al exportar visitas' });
  }
});

/* ========= Obtener TODAS las visitas (Solo Superadmin) ========= */
router.get('/', verificarToken, autorizarRoles('superadmin'), async (req, res) => {
  try {
    const visitas = await Visita.aggregate([
      {
        $match: { rol: 'invitado' } // Filtrar solo visitas de invitados
      },
      {
        $group: {
          _id: '$correo',
          nombre: { $first: '$nombre' },
          whatsapp: { $first: '$whatsapp' },
          visitas: { $sum: 1 },
          ultimaVisita: { $max: '$fechaHora' },
        },
      },
      { $sort: { ultimaVisita: -1 } },
      {
        $project: {
          _id: 0,
          correo: '$_id',
          nombre: 1,
          whatsapp: 1,
          visitas: 1,
          ultimaVisita: 1,
        },
      },
    ]);
    res.json(visitas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error al obtener visitas' });
  }
});

/* ========= Obtener actividad DE MIS ALUMNOS (Solo Profesor) ========= */
router.get('/alumnos', verificarToken, autorizarRoles('profesor'), async (req, res) => {
  try {
    const { id: profesorId } = req.usuario;

    const alumnos = await Alumno.find({ createdBy: profesorId })
      .select('rut tipo_documento numero_documento nombre apellido correo telefono semestre jornada conteo_ingresos')
      .sort({ apellido: 1, nombre: 1 })
      .lean();

    if (!alumnos || alumnos.length === 0) {
      return res.json([]);
    }

    const correosAlumnos = alumnos
      .map((a) => String(a.correo || '').trim().toLowerCase())
      .filter(Boolean);

    const visitas = await Visita.aggregate([
      {
        $match: {
          correo: { $in: correosAlumnos },
          rol: 'alumno',
        },
      },
      {
        $group: {
          _id: '$correo',
          ingresosIA: { $sum: 1 },
          ultimaVisita: { $max: '$fechaHora' },
        },
      },
      {
        $project: {
          _id: 0,
          correo: '$_id',
          ingresosIA: 1,
          ultimaVisita: 1,
        },
      },
    ]);

    const actividadPorCorreo = new Map(
      visitas.map((v) => [String(v.correo || '').toLowerCase(), v])
    );

    const rows = alumnos.map((alumno) => {
      const correo = String(alumno.correo || '').trim().toLowerCase();
      const actividad = actividadPorCorreo.get(correo);
      const documento = alumno.numero_documento || alumno.rut || '';
      const tipoDocumento = alumno.tipo_documento || (alumno.rut ? 'RUT' : 'Documento');

      const ingresosPorVisitas = Number(actividad?.ingresosIA || 0);
      const ingresosPorAlumno = Number(alumno.conteo_ingresos || 0);

      return {
        alumnoId: String(alumno._id),
        documento,
        rutDni: documento ? `${tipoDocumento} ${documento}` : '-',
        nombre: `${alumno.nombre || ''} ${alumno.apellido || ''}`.trim() || '-',
        correo,
        telefono: alumno.telefono || '',
        semestre: alumno.semestre ?? '',
        jornada: alumno.jornada || '',
        ingresosIA: Math.max(ingresosPorVisitas, ingresosPorAlumno),
        ultimaVisita: actividad?.ultimaVisita || null,
      };
    }).sort((a, b) => {
      const byLast = new Date(b.ultimaVisita || 0) - new Date(a.ultimaVisita || 0);
      return byLast || String(a.nombre).localeCompare(String(b.nombre), 'es');
    });

    return res.json(rows);
  } catch (err) {
    console.error('Error al obtener actividad de alumnos:', err);
    return res.status(500).json({ msg: 'Error al obtener la actividad de los alumnos' });
  }
});

/* ========= Obtener visitas DE MIS ALUMNOS (Solo Profesor) - legado ========= */
router.get('/alumnos-legacy', verificarToken, autorizarRoles('profesor'), async (req, res) => {
  try {
    const { id: profesorId } = req.usuario;

    // 1. Encontrar los alumnos de este profesor
    const alumnos = await Alumno.find({ createdBy: profesorId }).lean();

    // 2. Si no tiene alumnos, no puede ver ninguna visita
    if (!alumnos || alumnos.length === 0) {
      return res.json([]);
    }

    // 3. Extraer sus correos
    const correosAlumnos = alumnos.map((a) => a.correo);

    // 4. Crear el filtro para que `correo` esté en la lista de sus alumnos y el rol sea 'alumno'
    const filtroVisitas = { 
      correo: { $in: correosAlumnos },
      rol: 'alumno'
    };

    const visitas = await Visita.aggregate([
      { $match: filtroVisitas },
      {
        $group: {
          _id: '$correo',
          nombre: { $first: '$nombre' },
          whatsapp: { $first: '$whatsapp' },
          visitas: { $sum: 1 },
          ultimaVisita: { $max: '$fechaHora' },
        },
      },
      { $sort: { ultimaVisita: -1 } },
      {
        $project: {
          _id: 0,
          correo: '$_id',
          nombre: 1,
          whatsapp: 1,
          visitas: 1,
          ultimaVisita: 1,
        },
      },
    ]);
    res.json(visitas);
  } catch (err) {
    console.error('Error al obtener visitas de alumnos:', err);
    res.status(500).json({ msg: 'Error al obtener las visitas de los alumnos' });
  }
});

/* ========= Eliminar todas las visitas de un correo (Solo Superadmin) ========= */
router.delete('/:correo', verificarToken, autorizarRoles('superadmin'), async (req, res) => {
  try {
    const { correo } = req.params;
    const result = await Visita.deleteMany({ correo });

    if (result.deletedCount === 0) {
      return res.status(404).json({ msg: 'No se encontraron visitas para el correo proporcionado.' });
    }

    res.json({ msg: `Se eliminaron ${result.deletedCount} visitas.` });
  } catch (err) {
    console.error('Error al eliminar visitas:', err);
    res.status(500).json({ msg: 'Error al eliminar visitas' });
  }
});


module.exports = router;
