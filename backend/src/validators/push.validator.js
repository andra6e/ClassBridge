const { z } = require('zod');

const esquemaRegistrarTokenPush = z.object({
  token: z.string().min(20),
  plataforma: z.enum(['android', 'ios', 'web']).optional(),
});

const esquemaEliminarTokenPush = z.object({
  token: z.string().min(20),
});

module.exports = { esquemaRegistrarTokenPush, esquemaEliminarTokenPush };
