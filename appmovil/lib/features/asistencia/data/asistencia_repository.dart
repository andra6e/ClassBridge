import 'asistencia_api.dart';
import 'asistencia_models.dart';

class AsistenciaRepository {
  final _api = AsistenciaApi();

  Future<List<EstudianteModelo>> obtenerHijos() async {
    final resp = await _api.obtenerHijos();
    final lista = resp['data'] as List<dynamic>;
    return lista.map((e) => EstudianteModelo.fromJson(e)).toList();
  }

  Future<List<AsistenciaModelo>> obtenerHistorial(int idEstudiante) async {
    final resp = await _api.obtenerHistorial(idEstudiante);
    final lista = resp['data'] as List<dynamic>;
    return lista.map((e) => AsistenciaModelo.fromJson(e)).toList();
  }

  Future<List<ContenidoPendienteModelo>> obtenerContenidoPendiente(int idEstudiante) async {
    final resp = await _api.obtenerContenidoPendiente(idEstudiante);
    final lista = resp['data'] as List<dynamic>;
    return lista.map((e) => ContenidoPendienteModelo.fromJson(e)).toList();
  }

  Future<void> enviarJustificante({
    required int idAsistencia,
    required String motivo,
  }) async {
    await _api.enviarJustificante(
      idAsistencia: idAsistencia,
      motivo: motivo,
    );
  }
}
