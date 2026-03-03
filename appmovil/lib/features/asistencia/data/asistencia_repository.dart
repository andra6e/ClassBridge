import 'asistencia_api.dart';
import 'asistencia_models.dart';

class AsistenciaRepository {
  final _api = AsistenciaApi();

  Future<List<EstudianteModelo>> obtenerEstudiantes() async {
    final resp = await _api.obtenerEstudiantes();
    final lista = resp['data'] as List<dynamic>;
    return lista.map((e) => EstudianteModelo.fromJson(e)).toList();
  }

  Future<List<AsistenciaModelo>> obtenerHistorial(int idEstudiante) async {
    final resp = await _api.obtenerHistorial(idEstudiante);
    final lista = resp['data'] as List<dynamic>;
    return lista.map((e) => AsistenciaModelo.fromJson(e)).toList();
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
