import 'dart:async';
import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/env.dart';
import '../storage/secure_storage.dart';
import 'endpoints.dart';

class ErrorApi implements Exception {
  final String mensaje;
  final int? codigoHttp;
  ErrorApi(this.mensaje, {this.codigoHttp});
  @override
  String toString() => mensaje;
}

class ErrorSesionExpirada implements Exception {
  @override
  String toString() => 'Sesion expirada. Inicia sesion de nuevo.';
}

class ApiClient {
  static final ApiClient _instancia = ApiClient._();
  factory ApiClient() => _instancia;
  ApiClient._();

  String get _baseUrl => baseUrl;

  Future<Map<String, String>> _headers() async {
    final token = await AlmacenamientoSeguro.obtenerAccessToken();
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  static const _timeout = Duration(seconds: 15);

  Future<Map<String, dynamic>> get(String ruta) async {
    final respuesta = await _ejecutar(() async {
      final url = Uri.parse('$_baseUrl$ruta');
      return http.get(url, headers: await _headers()).timeout(_timeout);
    });
    return respuesta;
  }

  Future<Map<String, dynamic>> post(String ruta, Map<String, dynamic> cuerpo) async {
    final respuesta = await _ejecutar(() async {
      final url = Uri.parse('$_baseUrl$ruta');
      return http.post(url, headers: await _headers(), body: jsonEncode(cuerpo)).timeout(_timeout);
    });
    return respuesta;
  }

  Future<Map<String, dynamic>> delete(String ruta, Map<String, dynamic> cuerpo) async {
    final respuesta = await _ejecutar(() async {
      final url = Uri.parse('$_baseUrl$ruta');
      return http.delete(url, headers: await _headers(), body: jsonEncode(cuerpo)).timeout(_timeout);
    });
    return respuesta;
  }

  Future<Map<String, dynamic>> _ejecutar(
    Future<http.Response> Function() peticion,
  ) async {
    http.Response respuesta;
    try {
      respuesta = await peticion();
    } on TimeoutException {
      throw ErrorApi('Tiempo de espera agotado. Verifica que el backend este corriendo.');
    } catch (e) {
      throw ErrorApi('Error de conexion. Verifica tu red y que el backend este en http://localhost:3000');
    }

    if (respuesta.statusCode == 401) {
      final renovado = await _intentarRefresh();
      if (renovado) {
        try {
          respuesta = await peticion();
        } catch (_) {
          throw ErrorApi('Error de conexion tras renovar token.');
        }
        if (respuesta.statusCode == 401) {
          await AlmacenamientoSeguro.borrarTodo();
          throw ErrorSesionExpirada();
        }
      } else {
        await AlmacenamientoSeguro.borrarTodo();
        throw ErrorSesionExpirada();
      }
    }

    final cuerpo = jsonDecode(respuesta.body) as Map<String, dynamic>;

    if (respuesta.statusCode >= 200 && respuesta.statusCode < 300) {
      return cuerpo;
    }

    final mensaje = cuerpo['mensaje'] ?? 'Error del servidor';
    throw ErrorApi(mensaje.toString(), codigoHttp: respuesta.statusCode);
  }

  Future<bool> _intentarRefresh() async {
    final refreshToken = await AlmacenamientoSeguro.obtenerRefreshToken();
    if (refreshToken == null) return false;

    try {
      final url = Uri.parse('$_baseUrl${Endpoints.refresh}');
      final resp = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'refresh_token': refreshToken}),
      );

      if (resp.statusCode != 200) return false;

      final cuerpo = jsonDecode(resp.body) as Map<String, dynamic>;
      if (cuerpo['ok'] != true) return false;

      final data = cuerpo['data'] as Map<String, dynamic>;
      final tokens = data['tokens'] as Map<String, dynamic>;
      await AlmacenamientoSeguro.guardarTokens(
        accessToken: tokens['accessToken'],
        refreshToken: tokens['refreshToken'],
      );
      return true;
    } catch (_) {
      return false;
    }
  }
}
