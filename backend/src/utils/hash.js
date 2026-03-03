const bcrypt = require('bcryptjs');

const RONDAS_SAL = 12;

async function hashear(textoPlano) {
  return bcrypt.hash(textoPlano, RONDAS_SAL);
}

async function comparar(textoPlano, hash) {
  return bcrypt.compare(textoPlano, hash);
}

module.exports = { hashear, comparar };
