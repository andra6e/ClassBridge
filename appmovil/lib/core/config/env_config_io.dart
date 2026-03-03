import 'dart:io';

/// Configuracion para Android, iOS, Windows, Linux, macOS.
/// Android emulador: 10.0.2.2 = host localhost.
/// Demas plataformas: 127.0.0.1 = localhost.
String get baseUrl {
  if (Platform.isAndroid) {
    return 'http://10.0.2.2:3000';
  }
  return 'http://127.0.0.1:3000';
}
