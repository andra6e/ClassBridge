class EstudianteModelo {
  final int idEstudiante;
  final String nombreCompleto;
  final String? codigoMatricula;
  final String? nivelGrado;

  EstudianteModelo({
    required this.idEstudiante,
    required this.nombreCompleto,
    this.codigoMatricula,
    this.nivelGrado,
  });

  factory EstudianteModelo.fromJson(Map<String, dynamic> json) {
    return EstudianteModelo(
      idEstudiante: json['id_estudiante'],
      nombreCompleto: json['nombre_completo'],
      codigoMatricula: json['codigo_matricula'],
      nivelGrado: json['nivel_grado'],
    );
  }
}

class JustificanteModelo {
  final int idJustificante;
  final String motivo;
  final String estado;
  final String? notasRevision;

  JustificanteModelo({
    required this.idJustificante,
    required this.motivo,
    required this.estado,
    this.notasRevision,
  });

  factory JustificanteModelo.fromJson(Map<String, dynamic> json) {
    return JustificanteModelo(
      idJustificante: json['id_justificante'],
      motivo: json['motivo'],
      estado: json['estado'],
      notasRevision: json['notas_revision'],
    );
  }
}

class GrupoModelo {
  final int idGrupo;
  final String nombre;
  final String? materia;

  GrupoModelo({required this.idGrupo, required this.nombre, this.materia});

  factory GrupoModelo.fromJson(Map<String, dynamic> json) {
    return GrupoModelo(
      idGrupo: json['id_grupo'],
      nombre: json['nombre'],
      materia: json['materia'],
    );
  }
}

class SesionModelo {
  final int idSesion;
  final String fechaSesion;
  final int idGrupo;
  final GrupoModelo? grupo;

  SesionModelo({
    required this.idSesion,
    required this.fechaSesion,
    required this.idGrupo,
    this.grupo,
  });

  factory SesionModelo.fromJson(Map<String, dynamic> json) {
    return SesionModelo(
      idSesion: json['id_sesion'],
      fechaSesion: json['fecha_sesion'],
      idGrupo: json['id_grupo'],
      grupo: json['grupo'] != null ? GrupoModelo.fromJson(json['grupo']) : null,
    );
  }
}

class AsistenciaModelo {
  final int idAsistencia;
  final String estado;
  final String? notas;
  final String? registradoEn;
  final SesionModelo? sesion;
  final JustificanteModelo? justificante;

  AsistenciaModelo({
    required this.idAsistencia,
    required this.estado,
    this.notas,
    this.registradoEn,
    this.sesion,
    this.justificante,
  });

  bool get tieneJustificante => justificante != null;
  bool get esAusente => estado == 'ausente';
  bool get puedeJustificar => esAusente && !tieneJustificante;

  String get fechaFormateada {
    if (sesion == null) return '-';
    return sesion!.fechaSesion;
  }

  String get materiaGrupo {
    if (sesion?.grupo == null) return '-';
    return sesion!.grupo!.materia ?? sesion!.grupo!.nombre;
  }

  factory AsistenciaModelo.fromJson(Map<String, dynamic> json) {
    return AsistenciaModelo(
      idAsistencia: json['id_asistencia'],
      estado: json['estado'],
      notas: json['notas'],
      registradoEn: json['registrado_en'],
      sesion: json['sesion'] != null
          ? SesionModelo.fromJson(json['sesion'])
          : null,
      justificante: json['justificante'] != null
          ? JustificanteModelo.fromJson(json['justificante'])
          : null,
    );
  }
}
