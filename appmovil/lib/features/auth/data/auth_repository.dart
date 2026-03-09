import '../../../core/storage/secure_storage.dart';
import 'auth_api.dart';
import 'auth_models.dart';

class AuthRepository {
  final _api = AuthApi();

  Future<UsuarioModelo> login(String correo, String contrasena) async {
    final respuesta = await _api.login(correo, contrasena);
    final resultado = RespuestaLogin.fromJson(respuesta);

    await AlmacenamientoSeguro.guardarTokens(
      accessToken: resultado.accessToken,
      refreshToken: resultado.refreshToken,
    );
    await AlmacenamientoSeguro.guardarNombre(resultado.usuario.nombreCompleto);

    return resultado.usuario;
  }

  Future<void> cerrarSesion() async {
    final refresh = await AlmacenamientoSeguro.obtenerRefreshToken();
    if (refresh != null) {
      try { await _api.cerrarSesion(refresh); } catch (_) {}
    }
    await AlmacenamientoSeguro.borrarTodo();
  }

  Future<bool> estaAutenticado() async {
    final token = await AlmacenamientoSeguro.obtenerAccessToken();
    return token != null;
  }

  Future<String?> obtenerNombre() => AlmacenamientoSeguro.obtenerNombre();

  Future<void> verificarContrasena(String contrasena) async {
    await _api.verificarContrasena(contrasena);
  }
}
