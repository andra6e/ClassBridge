import '../../../core/network/api_client.dart';
import '../../../core/network/endpoints.dart';

class ChatApi {
  final _client = ApiClient();

  Future<Map<String, dynamic>> enviarMensaje({
    required int idEstudiante,
    required int idSesion,
    required String mensaje,
  }) {
    return _client.post(Endpoints.chatIA, {
      'id_estudiante': idEstudiante,
      'id_sesion': idSesion,
      'mensaje': mensaje,
    });
  }
}
