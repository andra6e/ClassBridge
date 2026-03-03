import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class AlmacenamientoSeguro {
  static const _almacen = FlutterSecureStorage();

  static const _llaveAccess = 'access_token';
  static const _llaveRefresh = 'refresh_token';
  static const _llaveNombre = 'nombre_padre';

  static Future<void> guardarTokens({
    required String accessToken,
    required String refreshToken,
  }) async {
    await _almacen.write(key: _llaveAccess, value: accessToken);
    await _almacen.write(key: _llaveRefresh, value: refreshToken);
  }

  static Future<String?> obtenerAccessToken() =>
      _almacen.read(key: _llaveAccess);

  static Future<String?> obtenerRefreshToken() =>
      _almacen.read(key: _llaveRefresh);

  static Future<void> guardarNombre(String nombre) =>
      _almacen.write(key: _llaveNombre, value: nombre);

  static Future<String?> obtenerNombre() =>
      _almacen.read(key: _llaveNombre);

  static Future<void> borrarTodo() => _almacen.deleteAll();
}
