import 'chat_api.dart';
import 'chat_models.dart';

class ChatRepository {
  final _api = ChatApi();

  Future<String> enviarMensaje({
    required int idEstudiante,
    required int idSesion,
    required String mensaje,
  }) async {
    final resp = await _api.enviarMensaje(
      idEstudiante: idEstudiante,
      idSesion: idSesion,
      mensaje: mensaje,
    );
    final resultado = RespuestaChatIA.fromJson(resp);
    return resultado.respuesta;
  }
}
