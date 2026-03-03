class Endpoints {
  static const String loginPadre = '/api/auth/login-padre';
  static const String refresh = '/api/auth/refresh';
  static const String logout = '/api/auth/logout';
  static const String estudiantesPadre = '/api/padres/estudiantes';

  static String asistenciaEstudiante(int idEstudiante) =>
      '/api/estudiantes/$idEstudiante/asistencia';

  static const String justificantes = '/api/justificantes';
  static const String chatIA = '/api/ia/chat';
}
