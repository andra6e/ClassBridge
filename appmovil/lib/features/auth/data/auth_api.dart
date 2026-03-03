import '../../../core/network/api_client.dart';
import '../../../core/network/endpoints.dart';

class AuthApi {
  final _client = ApiClient();

  Future<Map<String, dynamic>> login(String correo, String contrasena) {
    return _client.post(Endpoints.loginPadre, {
      'correo': correo,
      'contrasena': contrasena,
    });
  }

  Future<Map<String, dynamic>> cerrarSesion(String refreshToken) {
    return _client.post(Endpoints.logout, {
      'refresh_token': refreshToken,
    });
  }
}
