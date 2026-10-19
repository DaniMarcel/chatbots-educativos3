const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Alumno = require('../models/Alumno');
const Visita = require('../models/Visita');

test('años guardados por cuenta y año en el seguimiento, sin base de datos externa', async (t) => {
  const secretAnterior = process.env.JWT_SECRET;
  process.env.JWT_SECRET = 'academic-filters-local-test';
  const profesorId = '000000000000000000000001';
  const otroProfesorId = '000000000000000000000002';
  const usuario = (id) => ({ _id: id, rol: 'profesor', aniosAcademicos: [] });
  const usuarios = new Map([[profesorId, usuario(profesorId)], [otroProfesorId, usuario(otroProfesorId)]]);
  const consulta = (value) => ({ select() { return this; }, lean: async () => structuredClone(value) });
  t.mock.method(Admin, 'findById', (id) => consulta(usuarios.get(id) || null));
  t.mock.method(Admin, 'findByIdAndUpdate', (id, update, options) => {
    assert.equal(options.runValidators, true);
    const actual = usuarios.get(id);
    if (actual) actual.aniosAcademicos = [...new Set([...actual.aniosAcademicos, update.$addToSet.aniosAcademicos])];
    return consulta(actual || null);
  });

  const app = express();
  app.use(express.json());
  app.use('/api/cursos', require('../routes/cursos'));
  app.use('/api/visitas', require('../routes/visita'));
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  t.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    if (secretAnterior === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = secretAnterior;
  });
  const base = `http://127.0.0.1:${server.address().port}/api`;
  const request = (path, { id = profesorId, anio, autenticado = true } = {}) => fetch(`${base}${path}`, {
    method: anio === undefined ? 'GET' : 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(autenticado ? { Authorization: `Bearer ${jwt.sign({ id, rol: 'profesor' }, process.env.JWT_SECRET)}` } : {}),
    },
    ...(anio === undefined ? {} : { body: JSON.stringify({ anio }) }),
  });

  await t.test('requiere autenticación', async () => {
    assert.equal((await request('/cursos/anios-academicos', { autenticado: false })).status, 401);
  });

  await t.test('guarda años sin duplicados y los devuelve al volver a consultar', async () => {
    for (const anio of [2027, '2028', 2029, 2030, 2035, 2035]) {
      assert.equal((await request('/cursos/anios-academicos', { anio })).status, 200);
    }
    assert.deepEqual(await (await request('/cursos/anios-academicos')).json(), [2027, 2028, 2029, 2030, 2035]);
    assert.deepEqual(await (await request('/cursos/anios-academicos', { id: otroProfesorId })).json(), []);
  });

  await t.test('rechaza años fuera de rango, decimales y tipos inválidos', async () => {
    for (const anio of [1999, 10000, 2027.5, '202a', null, true, [], [2027], {}]) {
      assert.equal((await request('/cursos/anios-academicos', { anio })).status, 400);
    }
  });

  await t.test('el modelo admite los años agregados y valida sus límites', () => {
    assert.equal(new Admin({ aniosAcademicos: [2030, 2035] }).validateSync('aniosAcademicos'), undefined);
    for (const anio of [1999, 10000, 2027.5]) {
      assert.ok(new Admin({ aniosAcademicos: [anio] }).validateSync('aniosAcademicos'));
    }
  });

  await t.test('seguimiento incluye el año y alumnos con cero ingresos', async () => {
    const alumnos = [
      { _id: 'alumno-1', nombre: 'Alumno de prueba', correo: 'uno@example.test', anio: 2027, semestre: 1, jornada: 'Mañana', conteo_ingresos: 0 },
      { _id: 'alumno-2', nombre: 'Alumno con actividad', correo: 'dos@example.test', anio: 2028, semestre: 2, jornada: 'Tarde', conteo_ingresos: 3 },
    ];
    t.mock.method(Alumno, 'find', (filtro) => {
      assert.deepEqual(filtro, { createdBy: profesorId });
      return {
        select(campos) { assert.ok(campos.split(' ').includes('anio')); return this; },
        sort() { return this; },
        lean: async () => alumnos,
      };
    });
    t.mock.method(Visita, 'aggregate', async () => [
      { correo: 'dos@example.test', ingresosIA: 4, ultimaVisita: '2028-03-01T12:00:00Z' },
    ]);
    const response = await request('/visitas/alumnos');
    assert.equal(response.status, 200);
    const rows = await response.json();
    assert.equal(rows.find((a) => a.alumnoId === 'alumno-1').anio, 2027);
    assert.equal(rows.find((a) => a.alumnoId === 'alumno-1').ingresosIA, 0);
    assert.equal(rows.find((a) => a.alumnoId === 'alumno-2').ingresosIA, 4);
  });
});
