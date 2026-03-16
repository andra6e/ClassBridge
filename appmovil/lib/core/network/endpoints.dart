class Endpoints {
  static const String login = '/api/auth/login';
  static const String refresh = '/api/auth/refresh';
  static const String logout = '/api/auth/logout';
  static const String verificarContrasena = '/api/auth/verificar-contrasena';
  static const String hijos = '/api/padres/hijos';

  static String asistenciaHijo(int idEstudiante) =>
      '/api/padres/hijos/$idEstudiante/asistencia';

  static String contenidoPendiente(int idEstudiante) =>
      '/api/padres/hijos/$idEstudiante/contenido-pendiente';

  static const String justificantes = '/api/justificantes';
  static const String notificacionesPadre = '/api/padres/notificaciones';
    static const String pushToken = '/api/push/token';

  static const String iaConversaciones = '/api/ia/conversaciones';
  static const String iaChat = '/api/ia/chat';

  static String iaConversacionesEstudiante(int idEstudiante) =>
      '/api/ia/conversaciones/$idEstudiante';
}
