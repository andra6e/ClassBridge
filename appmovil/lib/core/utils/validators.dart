class Validadores {
  static String? correo(String? valor) {
    if (valor == null || valor.trim().isEmpty) {
      return 'Ingresa tu correo';
    }
    final regex = RegExp(r'^[\w\.\-]+@[\w\.\-]+\.\w{2,}$');
    if (!regex.hasMatch(valor.trim())) {
      return 'Correo no valido';
    }
    return null;
  }

  static String? contrasena(String? valor) {
    if (valor == null || valor.isEmpty) {
      return 'Ingresa tu contrasena';
    }
    if (valor.length < 6) {
      return 'Minimo 6 caracteres';
    }
    return null;
  }

  static String? requerido(String? valor, [String campo = 'Este campo']) {
    if (valor == null || valor.trim().isEmpty) {
      return '$campo es requerido';
    }
    return null;
  }
}
