/**
 * Inserta 50 padres (usuarios rol padre), 50 estudiantes y 50 matrículas en la base de datos.
 * Ejecutar desde la raíz del backend: node scripts/seed-50-estudiantes.js
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const { hashear } = require('../src/utils/hash');
const { Usuario, Estudiante, Grado, Matricula, sequelize } = require('../src/database');

const CONTRASENA_PADRES = 'Padre123!';
const ANIO_ESCOLAR = '2025-2026';

const APELLIDOS = [
  'García', 'López', 'Martínez', 'Hernández', 'González', 'Rodríguez', 'Pérez', 'Sánchez',
  'Ramírez', 'Torres', 'Flores', 'Rivera', 'Gómez', 'Díaz', 'Morales', 'Reyes', 'Ortiz',
  'Chávez', 'Ruiz', 'Mendoza', 'Vargas', 'Castillo', 'Jiménez', 'Moreno', 'Romero',
  'Herrera', 'Medina', 'Aguilar', 'Garza', 'Castro', 'Vázquez', 'Fernández', 'Sandoval',
];

const NOMBRES_M = [
  'Carlos', 'Luis', 'José', 'Juan', 'Miguel', 'Pedro', 'Antonio', 'Francisco',
  'Alejandro', 'Daniel', 'Roberto', 'Jorge', 'Ricardo', 'Fernando', 'Andrés', 'Diego',
  'Eduardo', 'Raúl', 'Javier', 'Sergio', 'Pablo', 'Manuel', 'Ángel', 'Rubén',
];

const NOMBRES_F = [
  'María', 'Ana', 'Laura', 'Carmen', 'Rosa', 'Patricia', 'Elena', 'Sofía',
  'Isabel', 'Lucía', 'Adriana', 'Claudia', 'Mónica', 'Gabriela', 'Valeria', 'Diana',
  'Andrea', 'Natalia', 'Paula', 'Victoria', 'Daniela', 'Camila', 'Elena', 'Rocío',
];

const NOMBRES_ESTUDIANTES = [
  'Sofía', 'Valentina', 'Isabella', 'Camila', 'Luciana', 'Mariana', 'Gabriela', 'Victoria',
  'Daniela', 'Martina', 'Lucía', 'Emma', 'Mía', 'Regina', 'Julia', 'Sara', 'Elena', 'Adriana',
  'Carlos', 'Santiago', 'Mateo', 'Sebastián', 'Leonardo', 'Diego', 'Nicolás', 'Daniel',
  'Alejandro', 'Miguel', 'Ángel', 'Adrián', 'Pablo', 'Lucas', 'Javier', 'Emilio',
];

function aleatorio(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function nombreCompleto( nombres, apellidos ) {
  return `${aleatorio(nombres)} ${aleatorio(apellidos)} ${aleatorio(apellidos)}`;
}

function fechaNacimientoAleatoria() {
  const anio = 2014 + Math.floor(Math.random() * 6);
  const mes = String(1 + Math.floor(Math.random() * 12)).padStart(2, '0');
  const dia = String(1 + Math.floor(Math.random() * 28)).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}

async function main() {
  console.log('Conectando a la base de datos...');
  await sequelize.authenticate();

  const grados = await Grado.findAll({ order: [['orden', 'ASC']], raw: true });
  if (!grados.length) {
    console.error('No hay grados en la base de datos. Ejecuta primero las migraciones y el seed inicial.');
    process.exit(1);
  }
  const idsGrados = grados.map((g) => g.id_grado);

  const hashPadre = await hashear(CONTRASENA_PADRES);
  const padresCreados = [];
  const estudiantesCreados = [];

  console.log('Creando 50 padres (usuarios rol padre)...');
  for (let i = 0; i < 50; i++) {
    const nombre = nombreCompleto(NOMBRES_M.concat(NOMBRES_F), APELLIDOS);
    const correo = `padre.seed${i + 1}@classbridge.demo`;
    const padre = await Usuario.create({
      nombre_completo: nombre,
      correo,
      hash_contrasena: hashPadre,
      rol: 'padre',
      telefono: `555${String(1000000 + i).slice(1)}`,
      activo: true,
    });
    padresCreados.push(padre);
  }
  console.log('Padres creados:', padresCreados.length);

  console.log('Creando 50 estudiantes...');
  for (let i = 0; i < 50; i++) {
    const nombre = nombreCompleto(NOMBRES_ESTUDIANTES, APELLIDOS);
    const sexo = Math.random() < 0.5 ? 'M' : 'F';
    const estudiante = await Estudiante.create({
      nombre_completo: nombre,
      fecha_nacimiento: fechaNacimientoAleatoria(),
      sexo,
      activo: true,
    });
    estudiantesCreados.push(estudiante);
  }
  console.log('Estudiantes creados:', estudiantesCreados.length);

  console.log('Creando 50 matrículas (vinculando cada estudiante con su padre y un grado)...');
  for (let i = 0; i < 50; i++) {
    const idGrado = aleatorio(idsGrados);
    await Matricula.create({
      id_padre: padresCreados[i].id_usuario,
      id_estudiante: estudiantesCreados[i].id_estudiante,
      id_grado: idGrado,
      anio_escolar: ANIO_ESCOLAR,
      estado: 'activa',
    });
  }
  console.log('Matrículas creadas: 50');

  console.log('\nListo. 50 estudiantes con sus respectivos padres y matrículas insertados.');
  console.log('Los padres pueden iniciar sesión con correo padre.seed1@classbridge.demo ... padre.seed50@classbridge.demo y contraseña:', CONTRASENA_PADRES);
  await sequelize.close();
  process.exit(0);
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
