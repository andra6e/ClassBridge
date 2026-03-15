import '../../../core/network/api_client.dart';
import '../../../core/network/endpoints.dart';

class AsistenciaApi {
  final _client = ApiClient();

  Future<Map<String, dynamic>> obtenerHijos() {
    return _client.get(Endpoints.hijos);
  }

  Future<Map<String, dynamic>> obtenerHistorial(int idEstudiante) {
    return _client.get(Endpoints.asistenciaHijo(idEstudiante));
  }

  Future<Map<String, dynamic>> obtenerContenidoPendiente(int idEstudiante) {
    return _client.get(Endpoints.contenidoPendiente(idEstudiante));
  }

  Future<Map<String, dynamic>> enviarJustificante({
    required int idAsistencia,
    required String motivo,
    Map<String, dynamic>? archivo,
  }) {
    final payload = {'id_asistencia': idAsistencia, 'motivo': motivo};
    if (archivo != null) payload['archivo'] = archivo;
    return _client.post(Endpoints.justificantes, payload);
  }

  Future<Map<String, dynamic>> obtenerNotificaciones() {
    return _client.get(Endpoints.notificacionesPadre);
  }
}
