import test from 'node:test';
import assert from 'node:assert/strict';
import { anioDe, filtrarAlumnosAcademicos, normalizarAnio, obtenerAniosAcademicos } from './filtrosAcademicos.js';

test('ofrece 2027 a 2030 sin alumnos y conserva años históricos y agregados', () => {
  const anios = obtenerAniosAcademicos([2022, '2035', 2026, '2035', null, 'inválido'], 2026);
  assert.deepEqual(anios, ['2035', '2030', '2029', '2028', '2027', '2026', '2025', '2022']);
  assert.ok(obtenerAniosAcademicos([], 2030).includes('2034'));
});

test('usa el año de ingreso en UTC y descarta valores inválidos', () => {
  assert.equal(anioDe({ anio: 2027 }), '2027');
  assert.equal(anioDe({ fechaIngreso: '2028-01-01T00:00:00.000Z' }), '2028');
  assert.equal(anioDe({ fechaIngreso: 'incorrecta' }), '');
  for (const valor of [1999, 10000, '2027.5', '', null]) assert.equal(normalizarAnio(valor), '');
});

test('combina año, semestre y jornada, incluyendo alumnos sin actividad', () => {
  const alumnos = [
    { id: 1, anio: 2027, semestre: 1, jornada: 'Mañana', ingresosIA: 4 },
    { id: 2, anio: 2027, semestre: '2', jornada: 'Mañana', ingresosIA: 3 },
    { id: 3, anio: 2027, semestre: 1, jornada: 'Tarde', ingresosIA: 2 },
    { id: 4, anio: 2026, semestre: 1, jornada: 'Mañana', ingresosIA: 7 },
    { id: 5, fechaIngreso: '2027-01-01', semestre: 1, jornada: 'Mañana', ingresosIA: 0 },
  ];
  assert.equal(filtrarAlumnosAcademicos(alumnos, {}).length, 5);
  assert.equal(filtrarAlumnosAcademicos(alumnos, { anio: '2027' }).length, 4);
  assert.equal(filtrarAlumnosAcademicos(alumnos, { semestre: '2' })[0].id, 2);
  const filtrados = filtrarAlumnosAcademicos(alumnos, { anio: '2027', semestre: '1', jornada: 'Mañana' });
  assert.deepEqual(filtrados.map((a) => a.id), [1, 5]);
  assert.equal(filtrados.reduce((total, a) => total + a.ingresosIA, 0), 4);
  assert.deepEqual(filtrarAlumnosAcademicos(alumnos, { anio: '2030' }), []);
});
