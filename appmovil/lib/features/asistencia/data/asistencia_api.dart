import '../../../core/network/api_client.dart';
import '../../../core/network/endpoints.dart';

class AsistenciaApi {
  final _client = ApiClient();

  Future<Map<String, dynamic>> obtenerEstudiantes() {
    return _client.get(Endpoints.estudiantesPadre);
  }

  Future<Map<String, dynamic>> obtenerHistorial(int idEstudiante) {
    return _client.get(Endpoints.asistenciaEstudiante(idEstudiante));
  }

  Future<Map<String, dynamic>> enviarJustificante({
    required int idAsistencia,
    required String motivo,
    String? urlAdjunto,
    String? nombreAdjunto,
  }) {
    return _client.post(Endpoints.justificantes, {
      'id_asistencia': idAsistencia,
      'motivo': motivo,
      if (urlAdjunto != null) 'url_adjunto': urlAdjunto,
      if (nombreAdjunto != null) 'nombre_adjunto': nombreAdjunto,
    });
  }
}
