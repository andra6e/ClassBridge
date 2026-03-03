const NIVELES = { error: 0, warn: 1, info: 2, debug: 3 };
const NIVEL_ACTUAL = NIVELES[process.env.LOG_LEVEL] ?? NIVELES.debug;

function formatear(nivel, mensaje, datos) {
  const marca = new Date().toISOString();
  const base = `[${marca}] [${nivel.toUpperCase()}] ${mensaje}`;
  return datos !== undefined ? `${base} ${JSON.stringify(datos)}` : base;
}

const logger = {
  error: (msg, datos) => { if (NIVEL_ACTUAL >= NIVELES.error) console.error(formatear('error', msg, datos)); },
  warn:  (msg, datos) => { if (NIVEL_ACTUAL >= NIVELES.warn)  console.warn(formatear('warn', msg, datos)); },
  info:  (msg, datos) => { if (NIVEL_ACTUAL >= NIVELES.info)  console.log(formatear('info', msg, datos)); },
  debug: (msg, datos) => { if (NIVEL_ACTUAL >= NIVELES.debug) console.log(formatear('debug', msg, datos)); },
};

module.exports = logger;
