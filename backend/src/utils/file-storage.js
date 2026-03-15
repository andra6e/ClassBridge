const fs = require('fs');
const path = require('path');

function sanitizarNombre(nombre = 'archivo') {
  return nombre
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_+/g, '_')
    .slice(0, 120);
}

function guardarArchivoBase64({ carpetaRelativa, archivo }) {
  if (!archivo?.base64 || !archivo?.nombre) return null;

  const nombreSeguro = sanitizarNombre(archivo.nombre);
  const timestamp = Date.now();
  const nombreFinal = `${timestamp}_${nombreSeguro}`;

  const carpetaAbs = path.join(__dirname, '..', 'uploads', carpetaRelativa);
  fs.mkdirSync(carpetaAbs, { recursive: true });

  const rutaAbs = path.join(carpetaAbs, nombreFinal);
  const buffer = Buffer.from(archivo.base64, 'base64');
  fs.writeFileSync(rutaAbs, buffer);

  return {
    nombre: archivo.nombre,
    mime: archivo.mime || 'application/octet-stream',
    url: `/uploads/${carpetaRelativa.replace(/^[\\/]+/, '').replace(/\\/g, '/')}/${nombreFinal}`,
  };
}

module.exports = { guardarArchivoBase64 };
