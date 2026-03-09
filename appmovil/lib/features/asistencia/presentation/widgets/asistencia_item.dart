import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';
import '../../data/asistencia_models.dart';

class AsistenciaItem extends StatelessWidget {
  final AsistenciaModelo asistencia;
  final VoidCallback? onTap;

  const AsistenciaItem({super.key, required this.asistencia, this.onTap});

  @override
  Widget build(BuildContext context) {
    final esPresente = asistencia.estado == 'presente';
    final color = esPresente ? AppColors.success : AppColors.error;
    final bgColor = esPresente ? AppColors.successSoft : AppColors.errorSoft;
    final texto = esPresente ? 'Presente' : 'Ausente';

    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(AppSizes.radiusMd),
        boxShadow: AppShadows.soft,
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(AppSizes.radiusMd),
        child: InkWell(
          onTap: asistencia.esAusente ? onTap : null,
          borderRadius: BorderRadius.circular(AppSizes.radiusMd),
          child: Padding(
            padding: const EdgeInsets.all(14),
            child: Row(
              children: [
                Container(
                  width: 42,
                  height: 42,
                  decoration: BoxDecoration(
                    color: bgColor,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(
                    esPresente ? Icons.check_rounded : Icons.close_rounded,
                    color: color,
                    size: 22,
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(asistencia.fecha, style: AppTextStyles.bodyMedium),
                      const SizedBox(height: 2),
                      Text(
                        asistencia.gradoNombre ?? '-',
                        style: AppTextStyles.caption,
                      ),
                    ],
                  ),
                ),
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                      decoration: BoxDecoration(
                        color: bgColor,
                        borderRadius: BorderRadius.circular(AppSizes.radiusFull),
                      ),
                      child: Text(
                        texto,
                        style: TextStyle(color: color, fontSize: 12, fontWeight: FontWeight.w600),
                      ),
                    ),
                    if (asistencia.tieneJustificante) ...[
                      const SizedBox(width: 6),
                      Container(
                        padding: const EdgeInsets.all(4),
                        decoration: BoxDecoration(
                          color: AppColors.warningSoft,
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: const Icon(Icons.description_outlined, size: 16, color: AppColors.warning),
                      ),
                    ],
                    if (asistencia.puedeJustificar) ...[
                      const SizedBox(width: 6),
                      const Icon(Icons.chevron_right_rounded, color: AppColors.textTertiary, size: 22),
                    ],
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
