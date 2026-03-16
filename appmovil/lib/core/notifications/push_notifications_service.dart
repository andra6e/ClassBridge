import 'dart:async';
import 'dart:io' show Platform;
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import '../storage/secure_storage.dart';
import '../../features/auth/data/auth_api.dart';

class PushNotificationsService {
  static final PushNotificationsService _instance =
      PushNotificationsService._();
  factory PushNotificationsService() => _instance;
  PushNotificationsService._();

  final AuthApi _authApi = AuthApi();
  StreamSubscription<String>? _tokenRefreshSub;
  bool _inicializado = false;

  String _detectarPlataforma() {
    if (Platform.isIOS) return 'ios';
    if (Platform.isAndroid) return 'android';
    return 'web';
  }

  Future<void> registrarTokenActual() async {
    try {
      if (Firebase.apps.isEmpty) {
        await Firebase.initializeApp();
      }

      final messaging = FirebaseMessaging.instance;
      await messaging.requestPermission(alert: true, badge: true, sound: true);

      final token = await messaging.getToken();
      if (token == null || token.isEmpty) return;

      final tokenGuardado = await AlmacenamientoSeguro.obtenerPushToken();
      if (tokenGuardado != token) {
        await _authApi.registrarTokenPush(
          token: token,
          plataforma: _detectarPlataforma(),
        );
        await AlmacenamientoSeguro.guardarPushToken(token);
      }

      if (!_inicializado) {
        _tokenRefreshSub = messaging.onTokenRefresh.listen((nuevoToken) async {
          try {
            await _authApi.registrarTokenPush(
              token: nuevoToken,
              plataforma: _detectarPlataforma(),
            );
            await AlmacenamientoSeguro.guardarPushToken(nuevoToken);
          } catch (_) {
            // ignorar para no romper la app
          }
        });
        _inicializado = true;
      }
    } catch (_) {
      // Si Firebase no está configurado aún, no romper flujo de login
    }
  }

  Future<void> eliminarTokenActual() async {
    try {
      final token = await AlmacenamientoSeguro.obtenerPushToken();
      if (token != null && token.isNotEmpty) {
        await _authApi.eliminarTokenPush(token);
      }
    } catch (_) {
      // ignorar
    } finally {
      await AlmacenamientoSeguro.borrarPushToken();
    }
  }

  Future<void> dispose() async {
    await _tokenRefreshSub?.cancel();
    _tokenRefreshSub = null;
    _inicializado = false;
  }
}
