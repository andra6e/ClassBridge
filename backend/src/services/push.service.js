const { Op } = require('sequelize');
const logger = require('../utils/logger');
const { DispositivoPush } = require('../database');

let adminFirebase = null;
let firebaseDisponible = null;

function obtenerMessaging() {
  if (firebaseDisponible === false) return null;

  try {
    if (!adminFirebase) {
      adminFirebase = require('firebase-admin');
    }

    if (!adminFirebase.apps.length) {
      const credencialesJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
      const credencialesPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

      if (credencialesJson) {
        const credentials = JSON.parse(credencialesJson);
        adminFirebase.initializeApp({
          credential: adminFirebase.credential.cert(credentials),
        });
      } else if (credencialesPath) {
        // eslint-disable-next-line global-require, import/no-dynamic-require
        const credentials = require(credencialesPath);
        adminFirebase.initializeApp({
          credential: adminFirebase.credential.cert(credentials),
        });
      } else {
        firebaseDisponible = false;
        logger.warn('Push deshabilitado: faltan credenciales FIREBASE_SERVICE_ACCOUNT_JSON o FIREBASE_SERVICE_ACCOUNT_PATH');
        return null;
      }
    }

    firebaseDisponible = true;
    return adminFirebase.messaging();
  } catch (err) {
    firebaseDisponible = false;
    logger.warn('Push deshabilitado: no se pudo inicializar Firebase Admin', { mensaje: err.message });
    return null;
  }
}

async function registrarToken({ id_usuario, rol, token, plataforma = 'android' }) {
  if (!token) return { error: 'Token requerido' };

  const existente = await DispositivoPush.findOne({ where: { token } });
  if (existente) {
    await existente.update({
      id_usuario,
      rol,
      plataforma,
      activo: true,
      ultimo_registro_en: new Date(),
    });
    return { registrado: true, id_dispositivo: existente.id_dispositivo };
  }

  const creado = await DispositivoPush.create({
    id_usuario,
    rol,
    token,
    plataforma,
    activo: true,
    ultimo_registro_en: new Date(),
  });

  return { registrado: true, id_dispositivo: creado.id_dispositivo };
}

async function eliminarToken({ id_usuario, token }) {
  if (!token) return { error: 'Token requerido' };

  const [actualizados] = await DispositivoPush.update(
    { activo: false },
    {
      where: {
        id_usuario,
        token,
      },
    },
  );

  return { eliminado: true, afectados: actualizados };
}

async function marcarTokensInactivos(tokens) {
  if (!tokens.length) return;
  await DispositivoPush.update(
    { activo: false },
    { where: { token: { [Op.in]: tokens } } },
  );
}

async function enviarPushAUsuarios({ idsUsuarios, titulo, cuerpo, data = {} }) {
  if (!idsUsuarios?.length) return { enviados: 0, tokens: 0, omitido: true };

  const dispositivos = await DispositivoPush.findAll({
    where: {
      id_usuario: { [Op.in]: idsUsuarios },
      activo: true,
    },
    attributes: ['token'],
  });

  const tokens = [...new Set(dispositivos.map((d) => d.token).filter(Boolean))];
  if (!tokens.length) return { enviados: 0, tokens: 0, omitido: true };

  const messaging = obtenerMessaging();
  if (!messaging) {
    return { enviados: 0, tokens: tokens.length, omitido: true };
  }

  const response = await messaging.sendEachForMulticast({
    tokens,
    notification: {
      title: titulo,
      body: cuerpo,
    },
    data: Object.entries(data).reduce((acc, [k, v]) => {
      if (v === null || v === undefined) return acc;
      acc[k] = String(v);
      return acc;
    }, {}),
  });

  const invalidos = [];
  response.responses.forEach((r, i) => {
    if (!r.success) {
      const code = r.error?.code || '';
      if (code.includes('registration-token-not-registered') || code.includes('invalid-registration-token')) {
        invalidos.push(tokens[i]);
      }
    }
  });

  if (invalidos.length) {
    await marcarTokensInactivos(invalidos);
  }

  return {
    enviados: response.successCount,
    fallidos: response.failureCount,
    tokens: tokens.length,
  };
}

module.exports = {
  registrarToken,
  eliminarToken,
  enviarPushAUsuarios,
};
