class EstudianteModelo {
  final int idEstudiante;
  final String nombreCompleto;
  final String? gradoNombre;

  EstudianteModelo({
    required this.idEstudiante,
    required this.nombreCompleto,
    this.gradoNombre,
  });

  factory EstudianteModelo.fromJson(Map<String, dynamic> json) {
    final estudiante = json['estudiante'] as Map<String, dynamic>?;
    final grado = json['grado'] as Map<String, dynamic>?;

    if (estudiante != null) {
      return EstudianteModelo(
        idEstudiante: estudiante['id_estudiante'],
        nombreCompleto: estudiante['nombre_completo'],
        gradoNombre: grado?['nombre'],
      );
    }
    return EstudianteModelo(
      idEstudiante: json['id_estudiante'],
      nombreCompleto: json['nombre_completo'],
      gradoNombre: json['grado']?['nombre'],
    );
  }
}

class JustificanteModelo {
  final int idJustificante;
  final String motivo;
  final String estado;

  JustificanteModelo({
    required this.idJustificante,
    required this.motivo,
    required this.estado,
  });

  factory JustificanteModelo.fromJson(Map<String, dynamic> json) {
    return JustificanteModelo(
      idJustificante: json['id_justificante'],
      motivo: json['motivo'],
      estado: json['estado'],
    );
  }
}

class AsistenciaModelo {
  final int idAsistencia;
  final String fecha;
  final String estado;
  final String? gradoNombre;
  final JustificanteModelo? justificante;

  AsistenciaModelo({
    required this.idAsistencia,
    required this.fecha,
    required this.estado,
    this.gradoNombre,
    this.justificante,
  });

  bool get tieneJustificante => justificante != null;
  bool get esAusente => estado == 'ausente';
  bool get puedeJustificar => esAusente && !tieneJustificante;

  factory AsistenciaModelo.fromJson(Map<String, dynamic> json) {
    return AsistenciaModelo(
      idAsistencia: json['id_asistencia'],
      fecha: json['fecha'] ?? '-',
      estado: json['estado'],
      gradoNombre: json['grado']?['nombre'],
      justificante: json['justificante'] != null
          ? JustificanteModelo.fromJson(json['justificante'])
          : null,
    );
  }
}

class ContenidoPendienteModelo {
  final int idContenido;
  final String fecha;
  final String tema;
  final String explicacion;
  final String? actividades;
  final String materiaNombre;

  ContenidoPendienteModelo({
    required this.idContenido,
    required this.fecha,
    required this.tema,
    required this.explicacion,
    this.actividades,
    required this.materiaNombre,
  });

  factory ContenidoPendienteModelo.fromJson(Map<String, dynamic> json) {
    return ContenidoPendienteModelo(
      idContenido: json['id_contenido'],
      fecha: json['fecha'] ?? '-',
      tema: json['tema'],
      explicacion: json['explicacion'],
      actividades: json['actividades'],
      materiaNombre: json['materia']?['nombre'] ?? '-',
    );
  }
}
