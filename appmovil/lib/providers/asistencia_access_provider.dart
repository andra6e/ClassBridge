import 'package:flutter/foundation.dart';
import '../features/auth/data/auth_repository.dart';

/// Provider que controla el acceso a la sección de asistencia.
/// El padre debe verificar su contraseña para ver justificantes y enviar excusas.
/// La verificación dura mientras la app esté abierta (se pierde al cerrar sesión).
class AsistenciaAccessProvider extends ChangeNotifier {
  final _authRepo = AuthRepository();

  bool _accesoVerificado = false;

  bool get accesoVerificado => _accesoVerificado;

  /// Verifica la contraseña del padre. Lanza [Exception] si falla.
  Future<void> verificarContrasena(String contrasena) async {
    await _authRepo.verificarContrasena(contrasena);
    _accesoVerificado = true;
    notifyListeners();
  }

  /// Revoca el acceso (ej. al cerrar sesión).
  void revocarAcceso() {
    _accesoVerificado = false;
    notifyListeners();
  }
}
