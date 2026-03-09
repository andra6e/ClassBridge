import '../../../core/network/api_client.dart';
import '../../../core/network/endpoints.dart';

class ChatApi {
  final _client = ApiClient();

  Future<Map<String, dynamic>> iniciarConversacion({
    required int idEstudiante,
    required int idContenido,
  }) {
    return _client.post(Endpoints.iaConversaciones, {
      'id_estudiante': idEstudiante,
      'id_contenido': idContenido,
    });
  }

  Future<Map<String, dynamic>> enviarMensaje({
    required int idConversacion,
    required String mensaje,
  }) {
    return _client.post(Endpoints.iaChat, {
      'id_conversacion': idConversacion,
      'mensaje': mensaje,
    });
  }

  Future<Map<String, dynamic>> listarConversaciones(int idEstudiante) {
    return _client.get(Endpoints.iaConversacionesEstudiante(idEstudiante));
  }
}
