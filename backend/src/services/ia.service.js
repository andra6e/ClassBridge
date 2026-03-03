const { GoogleGenAI } = require('@google/genai');
const logger = require('../utils/logger');
const {
  PadreEstudiante,
  InscripcionGrupo,
  SesionClase,
  ContenidoClase,
} = require('../database');

// ---------------------------------------------------------------------------
// Instrucciones del sistema para el tutor IA
// ---------------------------------------------------------------------------
const INSTRUCCIONES_TUTOR = [
  'Eres un tutor educativo que ayuda a estudiantes menores de edad.',
  'Responde siempre en espanol.',
  'Explica paso a paso, de forma simple, con ejemplos faciles.',
  'No inventes informacion fuera del contenido proporcionado.',
  'Si falta informacion, pide detalles al estudiante.',
].join(' ');

// ---------------------------------------------------------------------------
// Proveedores de IA
// ---------------------------------------------------------------------------

/**
 * Llama a Google Gemini usando el SDK oficial @google/genai.
 * Modelo configurable via GEMINI_MODEL, por defecto gemini-2.0-flash.
 */
async function llamarGemini(promptCompleto) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY no esta configurada en las variables de entorno');

  const modelo = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
  const ai = new GoogleGenAI({ apiKey });

  try {
    const respuesta = await ai.models.generateContent({
      model: modelo,
      contents: promptCompleto,
      config: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
    });

    const texto = respuesta.text;
    if (!texto) throw new Error('Gemini no devolvio texto en la respuesta');
    return texto;
  } catch (err) {
    const mensajeError = err.message || String(err);
    if (mensajeError.includes('429') || mensajeError.includes('RESOURCE_EXHAUSTED')) {
      throw new Error('Cuota de Gemini agotada. Intenta de nuevo mas tarde o verifica tu plan en https://ai.google.dev');
    }
    if (mensajeError.includes('403') || mensajeError.includes('PERMISSION_DENIED')) {
      throw new Error('API key de Gemini invalida o sin permisos. Verifica GEMINI_API_KEY en .env');
    }
    if (mensajeError.includes('404')) {
      throw new Error(`Modelo "${modelo}" no disponible. Cambia GEMINI_MODEL en .env`);
    }
    throw err;
  }
}

/**
 * Placeholder para OpenAI. Preparado para implementacion futura.
 * TODO: instalar openai SDK e implementar llamada real.
 */
async function llamarOpenAI(_promptCompleto) {
  logger.warn('Proveedor OpenAI no implementado todavia.');
  return [
    '[Proveedor OpenAI pendiente de implementacion]',
    '',
    'El sistema esta preparado para conectarse a OpenAI.',
    'Configura IA_PROVIDER=gemini para usar Google Gemini,',
    'o implementa la funcion llamarOpenAI() en ia.service.js.',
  ].join('\n');
}

/**
 * Selecciona y llama al proveedor de IA configurado en IA_PROVIDER.
 * Retorna null si no hay proveedor configurado.
 */
async function llamarProveedorIA(promptCompleto) {
  const proveedor = (process.env.IA_PROVIDER || '').toLowerCase();

  switch (proveedor) {
    case 'gemini':
      return llamarGemini(promptCompleto);
    case 'openai':
      return llamarOpenAI(promptCompleto);
    default:
      logger.warn(`Proveedor IA no configurado o desconocido: "${proveedor}"`);
      return null;
  }
}

// ---------------------------------------------------------------------------
// Funcion principal del servicio
// ---------------------------------------------------------------------------

/**
 * Genera respuesta de chat IA educativo.
 *
 * Flujo:
 * 1. Valida vinculo padre-estudiante (padre_estudiante)
 * 2. Valida inscripcion del estudiante al grupo de la sesion (inscripciones_grupo)
 * 3. Carga contenido y adjuntos de la sesion (contenido_clase + adjuntos_contenido)
 * 4. Construye prompt educativo con contexto de la clase
 * 5. Llama al proveedor IA (Gemini / OpenAI / fallback)
 * 6. Retorna respuesta con metadatos del contexto usado
 */
async function generarRespuestaChat({ id_padre, id_estudiante, id_sesion, mensaje }) {
  // -- Validar vinculo padre-estudiante --
  const vinculo = await PadreEstudiante.findOne({
    where: { id_padre, id_estudiante },
  });
  if (!vinculo) return { error: 'Estudiante no vinculado a tu cuenta' };

  // -- Validar que la sesion existe y obtener grupo --
  const sesion = await SesionClase.findByPk(id_sesion, {
    include: [{ association: 'grupo', attributes: ['id_grupo', 'nombre', 'materia'] }],
  });
  if (!sesion) return { error: 'Sesion no encontrada' };

  // -- Validar inscripcion del estudiante al grupo --
  const inscripcion = await InscripcionGrupo.findOne({
    where: { id_grupo: sesion.id_grupo, id_estudiante },
  });
  if (!inscripcion) return { error: 'El estudiante no esta inscrito en el grupo de esta sesion' };

  // -- Cargar contenido de la sesion con adjuntos --
  const contenido = await ContenidoClase.findOne({
    where: { id_sesion },
    include: [{
      association: 'adjuntos',
      attributes: ['nombre_archivo', 'tipo_archivo', 'url_archivo', 'texto_extraido'],
    }],
  });
  if (!contenido) return { error: 'No hay contenido disponible para esta sesion' };

  // -- Construir prompt educativo --
  const partes = [
    INSTRUCCIONES_TUTOR,
    '',
    'Tema de la clase:',
    contenido.titulo,
    '',
    'Resumen:',
    contenido.resumen,
  ];

  if (contenido.notas_extra) {
    partes.push('', 'Notas adicionales:', contenido.notas_extra);
  }

  if (contenido.adjuntos && contenido.adjuntos.length > 0) {
    const textosExtraidos = contenido.adjuntos
      .filter((a) => a.texto_extraido)
      .map((a) => `[${a.nombre_archivo}]: ${a.texto_extraido}`);
    if (textosExtraidos.length > 0) {
      partes.push('', 'Material adicional:', ...textosExtraidos);
    }
  }

  partes.push(
    '',
    'Pregunta del estudiante:',
    mensaje,
    '',
    'Explica paso a paso, de forma simple, con ejemplos faciles. No inventes informacion fuera del contenido proporcionado.'
  );

  const promptCompleto = partes.join('\n');

  // -- Llamar al proveedor de IA --
  let textoRespuesta;
  try {
    textoRespuesta = await llamarProveedorIA(promptCompleto);
  } catch (err) {
    logger.error('Error al llamar proveedor IA', { mensaje: err.message });
    return { error: `Error al generar respuesta de IA: ${err.message}` };
  }

  // Fallback si no hay proveedor configurado
  if (!textoRespuesta) {
    textoRespuesta = [
      '[Sin proveedor IA configurado]',
      '',
      `Tema: ${contenido.titulo}`,
      `Materia: ${sesion.grupo.materia || sesion.grupo.nombre}`,
      '',
      `Tu pregunta: "${mensaje}"`,
      '',
      'Configura IA_PROVIDER=gemini y GEMINI_API_KEY en el archivo .env para obtener respuestas reales.',
    ].join('\n');
  }

  return {
    respuesta: textoRespuesta,
    contexto_usado: {
      materia: sesion.grupo.materia || sesion.grupo.nombre,
      tema: contenido.titulo,
      fecha_sesion: sesion.fecha_sesion,
      proveedor: (process.env.IA_PROVIDER || 'ninguno').toLowerCase(),
    },
  };
}

module.exports = { generarRespuestaChat };
