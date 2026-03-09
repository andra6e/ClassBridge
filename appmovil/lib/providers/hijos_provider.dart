import 'package:flutter/foundation.dart';
import '../features/asistencia/data/asistencia_models.dart';
import '../features/asistencia/data/asistencia_repository.dart';

class HijosProvider extends ChangeNotifier {
  final _repo = AsistenciaRepository();

  List<EstudianteModelo> _hijos = [];
  EstudianteModelo? _hijoSeleccionado;
  bool _cargando = false;
  String? _error;

  List<EstudianteModelo> get hijos => _hijos;
  EstudianteModelo? get hijoSeleccionado => _hijoSeleccionado;
  bool get cargando => _cargando;
  String? get error => _error;

  Future<void> cargarHijos() async {
    if (_hijos.isNotEmpty) return;

    _cargando = true;
    _error = null;
    notifyListeners();

    try {
      final lista = await _repo.obtenerHijos();
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

  void seleccionarHijo(EstudianteModelo hijo) {
    _hijoSeleccionado = hijo;
    notifyListeners();
  }

  void limpiar() {
    _hijos = [];
    _hijoSeleccionado = null;
    _cargando = false;
    _error = null;
    notifyListeners();
  }
}
