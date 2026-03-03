class MensajeChat {
  final String texto;
  final bool esUsuario;
  final DateTime timestamp;

  MensajeChat({
    required this.texto,
    required this.esUsuario,
    DateTime? timestamp,
  }) : timestamp = timestamp ?? DateTime.now();
}

class RespuestaChatIA {
  final String respuesta;

  RespuestaChatIA({required this.respuesta});

  factory RespuestaChatIA.fromJson(Map<String, dynamic> json) {
    final data = json['data'] as Map<String, dynamic>;
    return RespuestaChatIA(respuesta: data['respuesta']);
  }
}
