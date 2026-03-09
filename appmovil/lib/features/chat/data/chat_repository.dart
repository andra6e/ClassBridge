import 'chat_api.dart';
import 'chat_models.dart';

class ChatRepository {
  final _api = ChatApi();

  Future<Map<String, dynamic>> iniciarConversacion({
    required int idEstudiante,
    required int idContenido,
  }) async {
    final resp = await _api.iniciarConversacion(
      idEstudiante: idEstudiante,
      idContenido: idContenido,
    );
    final data = resp['data'] as Map<String, dynamic>;
    return data;
  }

  Future<String> enviarMensaje({
    required int idConversacion,
    required String mensaje,
  }) async {
    final resp = await _api.enviarMensaje(
      idConversacion: idConversacion,
      mensaje: mensaje,
    );
    final data = resp['data'] as Map<String, dynamic>;
    return data['respuesta'];
  }

  Future<List<ConversacionModelo>> listarConversaciones(int idEstudiante) async {
    final resp = await _api.listarConversaciones(idEstudiante);
    final lista = resp['data'] as List<dynamic>;
    return lista.map((e) => ConversacionModelo.fromJson(e)).toList();
  }
}
