class MensajeChat {
  final String texto;
  final bool esUsuario;
  final DateTime timestamp;

  MensajeChat({
    required this.texto,
    required this.esUsuario,
    DateTime? timestamp,
  }) : timestamp = timestamp ?? DateTime.now();

  factory MensajeChat.fromJson(Map<String, dynamic> json) {
    return MensajeChat(
      texto: json['contenido'],
      esUsuario: json['rol'] == 'user',
      timestamp: json['creado_en'] != null
          ? DateTime.parse(json['creado_en'])
          : DateTime.now(),
    );
  }
}

class ConversacionModelo {
  final int idConversacion;
  final int idEstudiante;
  final int idContenido;
  final String? materiaNombre;
  final String? tema;
  final String? fecha;

  ConversacionModelo({
    required this.idConversacion,
    required this.idEstudiante,
    required this.idContenido,
    this.materiaNombre,
    this.tema,
    this.fecha,
  });

  factory ConversacionModelo.fromJson(Map<String, dynamic> json) {
    final contenido = json['contenido'] as Map<String, dynamic>?;
    return ConversacionModelo(
      idConversacion: json['id_conversacion'],
      idEstudiante: json['id_estudiante'],
      idContenido: json['id_contenido'],
      materiaNombre: contenido?['materia']?['nombre'],
      tema: contenido?['tema'],
      fecha: contenido?['fecha'],
    );
  }
}
