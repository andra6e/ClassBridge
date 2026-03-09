import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';

class AccionesRapidas extends StatelessWidget {
  final void Function(String texto) onSeleccionar;

  const AccionesRapidas({super.key, required this.onSeleccionar});

  static const _acciones = [
    {'texto': 'Explicar facil', 'icono': Icons.lightbulb_outline},
    {'texto': 'Dame ejemplos', 'icono': Icons.format_list_numbered},
    {'texto': 'Hazme preguntas', 'icono': Icons.quiz_outlined},
    {'texto': 'Resumir', 'icono': Icons.summarize_outlined},
  ];

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.only(top: 6, bottom: 2),
      child: SizedBox(
        height: 36,
        child: ListView.separated(
          scrollDirection: Axis.horizontal,
          padding: const EdgeInsets.symmetric(horizontal: 16),
          itemCount: _acciones.length,
          separatorBuilder: (_, __) => const SizedBox(width: 8),
          itemBuilder: (context, i) {
            final accion = _acciones[i];
            return GestureDetector(
              onTap: () => onSeleccionar(accion['texto'] as String),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 14),
                decoration: BoxDecoration(
                  color: AppColors.surfaceAlt,
                  borderRadius: BorderRadius.circular(AppSizes.radiusFull),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(accion['icono'] as IconData, size: 15, color: AppColors.textSecondary),
                    const SizedBox(width: 6),
                    Text(
                      accion['texto'] as String,
                      style: AppTextStyles.bodySm.copyWith(
                        fontWeight: FontWeight.w500,
                        color: AppColors.textPrimary,
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}
