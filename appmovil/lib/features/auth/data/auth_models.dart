class UsuarioModelo {
  final int idUsuario;
  final String nombreCompleto;
  final String correo;
  final String rol;

  UsuarioModelo({
    required this.idUsuario,
    required this.nombreCompleto,
    required this.correo,
    required this.rol,
  });

  factory UsuarioModelo.fromJson(Map<String, dynamic> json) {
    return UsuarioModelo(
      idUsuario: json['id_usuario'],
      nombreCompleto: json['nombre_completo'],
      correo: json['correo'],
      rol: json['rol'],
    );
  }
}

class RespuestaLogin {
  final String accessToken;
  final String refreshToken;
  final UsuarioModelo usuario;

  RespuestaLogin({
    required this.accessToken,
    required this.refreshToken,
    required this.usuario,
  });

  factory RespuestaLogin.fromJson(Map<String, dynamic> json) {
    final data = json['data'] as Map<String, dynamic>;
    final tokens = data['tokens'] as Map<String, dynamic>;
    return RespuestaLogin(
      accessToken: tokens['accessToken'],
      refreshToken: tokens['refreshToken'],
      usuario: UsuarioModelo.fromJson(data['usuario']),
    );
  }
}
