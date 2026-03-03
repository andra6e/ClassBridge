import 'package:flutter/material.dart';
import '../../data/asistencia_models.dart';

class AsistenciaItem extends StatelessWidget {
  final AsistenciaModelo asistencia;
  final VoidCallback? onTap;

  const AsistenciaItem({
    super.key,
    required this.asistencia,
    this.onTap,
  });

  Color _colorEstado() {
    switch (asistencia.estado) {
      case 'presente':
        return Colors.green;
      case 'ausente':
        return Colors.red;
      case 'tarde':
        return Colors.orange;
      case 'justificado':
        return Colors.blue;
      default:
        return Colors.grey;
    }
  }

  IconData _iconoEstado() {
    switch (asistencia.estado) {
      case 'presente':
        return Icons.check_circle;
      case 'ausente':
        return Icons.cancel;
      case 'tarde':
        return Icons.access_time;
      case 'justificado':
        return Icons.verified;
      default:
        return Icons.help;
    }
  }

  String _textoEstado() {
    switch (asistencia.estado) {
      case 'presente':
        return 'Presente';
      case 'ausente':
        return 'Ausente';
      case 'tarde':
        return 'Tarde';
      case 'justificado':
        return 'Justificado';
      default:
        return asistencia.estado;
    }
  }

  @override
  Widget build(BuildContext context) {
    final color = _colorEstado();

    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      child: ListTile(
        onTap: asistencia.esAusente ? onTap : null,
        leading: Icon(_iconoEstado(), color: color, size: 28),
        title: Text(
          asistencia.fechaFormateada,
          style: const TextStyle(fontWeight: FontWeight.w600),
        ),
        subtitle: Text(
          asistencia.materiaGrupo,
          style: TextStyle(color: Colors.grey.shade600, fontSize: 13),
        ),
        trailing: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Text(
                _textoEstado(),
                style: TextStyle(
                  color: color,
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
            if (asistencia.tieneJustificante) ...[
              const SizedBox(width: 6),
              const Icon(Icons.description, size: 18, color: Colors.blue),
            ],
            if (asistencia.puedeJustificar) ...[
              const SizedBox(width: 6),
              const Icon(Icons.chevron_right, color: Colors.grey),
            ],
          ],
        ),
      ),
    );
  }
}
