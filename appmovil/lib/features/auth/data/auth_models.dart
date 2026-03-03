class PadreModelo {
  final int idPadre;
  final String nombreCompleto;
  final String correo;
  final int idEscuela;

  PadreModelo({
    required this.idPadre,
    required this.nombreCompleto,
    required this.correo,
    required this.idEscuela,
  });

  factory PadreModelo.fromJson(Map<String, dynamic> json) {
    return PadreModelo(
      idPadre: json['id_padre'],
      nombreCompleto: json['nombre_completo'],
      correo: json['correo'],
      idEscuela: json['id_escuela'],
    );
  }
}

class RespuestaLogin {
  final String accessToken;
  final String refreshToken;
  final PadreModelo padre;

  RespuestaLogin({
    required this.accessToken,
    required this.refreshToken,
    required this.padre,
  });

  factory RespuestaLogin.fromJson(Map<String, dynamic> json) {
    final data = json['data'] as Map<String, dynamic>;
    final tokens = data['tokens'] as Map<String, dynamic>;
    return RespuestaLogin(
      accessToken: tokens['accessToken'],
      refreshToken: tokens['refreshToken'],
      padre: PadreModelo.fromJson(data['padre']),
    );
  }
}
