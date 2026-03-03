import 'package:flutter/material.dart';

class AccionesRapidas extends StatelessWidget {
  final void Function(String texto) onSeleccionar;

  const AccionesRapidas({super.key, required this.onSeleccionar});

  static const _acciones = [
    {'texto': 'Resumir', 'icono': Icons.summarize},
    {'texto': 'Explicar facil', 'icono': Icons.lightbulb_outline},
    {'texto': 'Dame ejemplos', 'icono': Icons.format_list_numbered},
    {'texto': 'Hazme preguntas', 'icono': Icons.quiz_outlined},
  ];

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 38,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 12),
        itemCount: _acciones.length,
        separatorBuilder: (_, __) => const SizedBox(width: 8),
        itemBuilder: (context, i) {
          final accion = _acciones[i];
          return ActionChip(
            avatar: Icon(accion['icono'] as IconData, size: 16),
            label: Text(
              accion['texto'] as String,
              style: const TextStyle(fontSize: 12),
            ),
            onPressed: () => onSeleccionar(accion['texto'] as String),
            materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
            visualDensity: VisualDensity.compact,
          );
        },
      ),
    );
  }
}
