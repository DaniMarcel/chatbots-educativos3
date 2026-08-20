// models/HistorialSemestre.js
const mongoose = require('mongoose');

/**
 * Sub-esquema para el snapshot de cada alumno archivado.
 * Se embebe directamente (no referencia) para que el historial
 * sea inmutable e independiente de la colección Alumnos.
 */
const AlumnoSnapshotSchema = new mongoose.Schema(
  {
    correo:            { type: String },
    nombre:            { type: String },
    apellido:          { type: String },
    tipo_documento:    { type: String },
    numero_documento:  { type: String },
    rut:               { type: String },
    telefono:          { type: String },
    semestre:          { type: Number },
    jornada:           { type: String },
    anio:              { type: Number },
    fechaIngreso:      { type: Date },
    habilitado:        { type: Boolean },
    color_riesgo:      { type: String },
    conteo_ingresos:   { type: Number },
    rol:               { type: String },
    createdAt:         { type: Date },
  },
  { _id: false }
);

const HistorialSemestreSchema = new mongoose.Schema(
  {
    anio: {
      type: Number,
      required: true,
      min: 2000,
      max: 9999,
      index: true,
    },
    semestre: {
      type: Number,
      enum: [1, 2],
      required: true,
    },
    etiqueta: {
      type: String,
      required: true,
      trim: true,
    },
    fechaArchivado: {
      type: Date,
      required: true,
      default: Date.now,
    },
    archivadoPor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true,
    },
    archivadoPorNombre: {
      type: String,
      trim: true,
    },
    totalAlumnos: {
      type: Number,
      default: 0,
    },
    alumnos: [AlumnoSnapshotSchema],
  },
  { timestamps: true }
);

// Índice compuesto para búsquedas rápidas
HistorialSemestreSchema.index({ anio: -1, semestre: 1 });
HistorialSemestreSchema.index({ archivadoPor: 1, fechaArchivado: -1 });

module.exports = mongoose.model('HistorialSemestre', HistorialSemestreSchema);
