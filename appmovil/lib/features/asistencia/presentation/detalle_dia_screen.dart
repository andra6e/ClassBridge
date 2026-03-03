import 'package:flutter/material.dart';
import '../../../shared/widgets/primary_button.dart';
import '../data/asistencia_models.dart';
import '../data/asistencia_repository.dart';
import 'widgets/justificar_modal.dart';

class DetalleDiaScreen extends StatelessWidget {
  final AsistenciaModelo asistencia;

  const DetalleDiaScreen({super.key, required this.asistencia});

  void _abrirModalJustificante(BuildContext context) async {
    final repo = AsistenciaRepository();
    final resultado = await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (_) => JustificarModal(
        fecha: asistencia.fechaFormateada,
        onEnviar: (motivo) => repo.enviarJustificante(
          idAsistencia: asistencia.idAsistencia,
          motivo: motivo,
        ),
      ),
    );

    if (resultado == true && context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Justificante enviado correctamente'),
          backgroundColor: Colors.green,
        ),
      );
      Navigator.of(context).pop(true);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Detalle del dia')),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _fila('Fecha', asistencia.fechaFormateada),
                    const SizedBox(height: 10),
                    _fila('Materia', asistencia.materiaGrupo),
                    const SizedBox(height: 10),
                    _fila('Estado', _textoEstado(asistencia.estado)),
                    if (asistencia.notas != null) ...[
                      const SizedBox(height: 10),
                      _fila('Notas', asistencia.notas!),
                    ],
                    if (asistencia.tieneJustificante) ...[
                      const Divider(height: 24),
                      const Text(
                        'Justificante enviado',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 15,
                        ),
                      ),
                      const SizedBox(height: 8),
                      _fila('Motivo', asistencia.justificante!.motivo),
                      const SizedBox(height: 6),
                      _fila('Estado', asistencia.justificante!.estado),
                      if (asistencia.justificante!.notasRevision != null) ...[
                        const SizedBox(height: 6),
                        _fila('Notas revision',
                            asistencia.justificante!.notasRevision!),
                      ],
                    ],
                  ],
                ),
              ),
            ),
            const Spacer(),
            if (asistencia.puedeJustificar)
              BotonPrimario(
                texto: 'Enviar justificante',
                onPressed: () => _abrirModalJustificante(context),
                color: Colors.orange,
              ),
          ],
        ),
      ),
    );
  }

  Widget _fila(String etiqueta, String valor) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          width: 110,
          child: Text(
            etiqueta,
            style: const TextStyle(
              fontWeight: FontWeight.w600,
              color: Colors.black54,
            ),
          ),
        ),
        Expanded(child: Text(valor)),
      ],
    );
  }

  String _textoEstado(String estado) {
    switch (estado) {
      case 'presente':
        return 'Presente';
      case 'ausente':
        return 'Ausente';
      case 'tarde':
        return 'Tarde';
      case 'justificado':
        return 'Justificado';
      default:
        return estado;
    }
  }
}
