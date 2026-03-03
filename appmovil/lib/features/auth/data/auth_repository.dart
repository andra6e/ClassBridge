import '../../../core/storage/secure_storage.dart';
import 'auth_api.dart';
import 'auth_models.dart';

class AuthRepository {
  final _api = AuthApi();

  Future<PadreModelo> login(String correo, String contrasena) async {
    final respuesta = await _api.login(correo, contrasena);
    final resultado = RespuestaLogin.fromJson(respuesta);

    await AlmacenamientoSeguro.guardarTokens(
      accessToken: resultado.accessToken,
      refreshToken: resultado.refreshToken,
    );
    await AlmacenamientoSeguro.guardarNombre(resultado.padre.nombreCompleto);

    return resultado.padre;
  }

  Future<void> cerrarSesion() async {
    final refresh = await AlmacenamientoSeguro.obtenerRefreshToken();
    if (refresh != null) {
      try {
        await _api.cerrarSesion(refresh);
      } catch (_) {}
    }
    await AlmacenamientoSeguro.borrarTodo();
  }

  Future<bool> estaAutenticado() async {
    final token = await AlmacenamientoSeguro.obtenerAccessToken();
    return token != null;
  }

  Future<String?> obtenerNombre() => AlmacenamientoSeguro.obtenerNombre();
}
