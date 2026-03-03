import 'package:flutter/foundation.dart';
import '../features/asistencia/data/asistencia_models.dart';
import '../features/asistencia/data/asistencia_repository.dart';

class HijosProvider extends ChangeNotifier {
  final _repo = AsistenciaRepository();

  List<EstudianteModelo> _hijos = [];
  EstudianteModelo? _hijoSeleccionado;
  bool _cargando = false;
  String? _error;

  // ─── Getters ───────────────────────────────────────────────
  List<EstudianteModelo> get hijos => _hijos;
  EstudianteModelo? get hijoSeleccionado => _hijoSeleccionado;
  bool get cargando => _cargando;
  String? get error => _error;

  // ─── Cargar hijos (una sola vez) ──────────────────────────
  Future<void> cargarHijos() async {
    if (_hijos.isNotEmpty) return; // ya se cargaron

    _cargando = true;
    _error = null;
    notifyListeners();

    try {
      final lista = await _repo.obtenerEstudiantes();
      _hijos = lista;
      if (lista.isNotEmpty) {
        _hijoSeleccionado = lista.first;
      }
    } catch (e) {
      _error = e.toString();
    } finally {
      _cargando = false;
      notifyListeners();
    }
  }

  // ─── Seleccionar hijo ─────────────────────────────────────
  void seleccionarHijo(EstudianteModelo hijo) {
    _hijoSeleccionado = hijo;
    notifyListeners();
  }

  // ─── Limpiar al cerrar sesión ─────────────────────────────
  void limpiar() {
    _hijos = [];
    _hijoSeleccionado = null;
    _cargando = false;
    _error = null;
    notifyListeners();
  }
}
