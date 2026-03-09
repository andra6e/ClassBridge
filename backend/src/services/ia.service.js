const { GoogleGenAI } = require('@google/genai');
const logger = require('../utils/logger');
const {
  ConversacionIA, MensajeIA, ContenidoClase, Matricula, Asistencia,
} = require('../database');

const INSTRUCCIONES_TUTOR = [
  'Eres un tutor educativo amigable que ayuda a estudiantes de primaria.',
  'Responde siempre en español.',
  'Usa el contenido de la clase proporcionado como base para tus explicaciones.',
  'Explica paso a paso, de forma simple, con ejemplos fáciles de entender.',
  'Si el estudiante no entiende, intenta explicar de otra manera.',
  'No inventes información fuera del contenido proporcionado.',
  'Mantén un tono motivador y paciente.',
].join(' ');

async function llamarGemini(mensajes) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY no configurada en .env');

  try {
    const ai = new GoogleGenAI({ apiKey });
    const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
    const contents = mensajes.map((m) => ({
      role: m.rol === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.contenido }],
    }));

    const response = await ai.models.generateContent({
      model,
      contents,
    });

    return response.text;
  } catch (err) {
    logger.error('Error llamando a Gemini', { status: err.status, message: err.message });
    if (err.status === 429) throw new Error('Limite de solicitudes alcanzado, intenta mas tarde');
    if (err.status === 403) throw new Error('Acceso denegado al servicio de IA');
    if (err.status === 404) throw new Error('Modelo de IA no disponible');
    throw new Error('Error al comunicarse con el servicio de IA');
  }
}

async function iniciarObtenerConversacion({ id_estudiante, id_contenido, id_padre }) {
  const vinculo = await Matricula.findOne({
    where: { id_padre, id_estudiante },
  });
  if (!vinculo) return { error: 'No tienes acceso a este estudiante' };

  const contenido = await ContenidoClase.findByPk(id_contenido, {
    include: [{ association: 'materia' }, { association: 'grado' }],
  });
  if (!contenido) return { error: 'Contenido no encontrado' };

  const matricula = await Matricula.findOne({
    where: { id_estudiante, id_grado: contenido.id_grado, estado: 'activa' },
  });
  if (!matricula) return { error: 'El estudiante no pertenece a ese grado' };

  const [conversacion] = await ConversacionIA.findOrCreate({
    where: { id_estudiante, id_contenido },
    defaults: { id_estudiante, id_contenido },
  });

  const mensajes = await MensajeIA.findAll({
    where: { id_conversacion: conversacion.id_conversacion },
    order: [['creado_en', 'ASC']],
  });

  return { conversacion, mensajes, contenido };
}

async function enviarMensaje({ id_conversacion, mensaje, id_padre }) {
  const conversacion = await ConversacionIA.findByPk(id_conversacion, {
    include: [
      { association: 'contenido', include: ['materia', 'grado'] },
      { association: 'estudiante' },
    ],
  });
  if (!conversacion) return { error: 'Conversacion no encontrada' };

  const vinculo = await Matricula.findOne({
    where: { id_padre, id_estudiante: conversacion.id_estudiante },
  });
  if (!vinculo) return { error: 'No tienes acceso a esta conversacion' };

  await MensajeIA.create({
    id_conversacion,
    rol: 'user',
    contenido: mensaje,
  });

  const historial = await MensajeIA.findAll({
    where: { id_conversacion },
    order: [['creado_en', 'ASC']],
  });

  const contenido = conversacion.contenido;
  const contexto = [
    INSTRUCCIONES_TUTOR,
    '',
    'Contenido de la clase:',
    `Materia: ${contenido.materia?.nombre || 'Sin materia'}`,
    `Tema: ${contenido.tema}`,
    `Explicación: ${contenido.explicacion}`,
    `Actividades: ${contenido.actividades || 'Ninguna'}`,
  ].join('\n');

  const mensajesParaIA = [
    { rol: 'user', contenido: contexto },
    { rol: 'assistant', contenido: 'Entendido. Estoy listo para ayudar al estudiante con este tema. ¿En qué puedo ayudarte?' },
    ...historial.map((m) => ({ rol: m.rol, contenido: m.contenido })),
  ];

  const respuestaTexto = await llamarGemini(mensajesParaIA);

  const mensajeGuardado = await MensajeIA.create({
    id_conversacion,
    rol: 'assistant',
    contenido: respuestaTexto,
  });

  return { respuesta: respuestaTexto, mensaje_guardado: mensajeGuardado };
}

async function listarConversaciones(idEstudiante) {
  return ConversacionIA.findAll({
    where: { id_estudiante: idEstudiante },
    include: [
      { association: 'contenido', include: ['materia', 'grado'] },
      { association: 'mensajes', limit: 1, order: [['creado_en', 'DESC']], separate: true },
    ],
    order: [['creado_en', 'DESC']],
  });
}

module.exports = {
  llamarGemini,
  iniciarObtenerConversacion,
  enviarMensaje,
  listarConversaciones,
};
