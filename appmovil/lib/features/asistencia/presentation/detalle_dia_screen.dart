import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';
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
      backgroundColor: Colors.transparent,
      builder: (_) => JustificarModal(
        fecha: asistencia.fecha,
        onEnviar: (motivo) => repo.enviarJustificante(
          idAsistencia: asistencia.idAsistencia,
          motivo: motivo,
        ),
      ),
    );

    if (resultado == true && context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('Justificante enviado correctamente'),
          backgroundColor: AppColors.success,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        ),
      );
      Navigator.of(context).pop(true);
    }
  }

  @override
  Widget build(BuildContext context) {
    final esPresente = asistencia.estado == 'presente';
    final color = esPresente ? AppColors.success : AppColors.error;
    final bgColor = esPresente ? AppColors.successSoft : AppColors.errorSoft;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('Detalle del dia', style: AppTextStyles.heading3),
        backgroundColor: AppColors.surface,
      ),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(AppSizes.radiusMd),
                boxShadow: AppShadows.soft,
              ),
              child: Column(
                children: [
                  Container(
                    width: 56,
                    height: 56,
                    decoration: BoxDecoration(
                      color: bgColor,
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Icon(
                      esPresente ? Icons.check_rounded : Icons.close_rounded,
                      color: color,
                      size: 28,
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    esPresente ? 'Presente' : 'Ausente',
                    style: AppTextStyles.heading3.copyWith(color: color),
                  ),
                  const SizedBox(height: 20),
                  _fila('Fecha', asistencia.fecha),
                  const SizedBox(height: 12),
                  _fila('Grado', asistencia.gradoNombre ?? '-'),
                  if (asistencia.tieneJustificante) ...[
                    Padding(
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      child: Divider(color: AppColors.borderLight, height: 1),
                    ),
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: AppColors.warningSoft,
                        borderRadius: BorderRadius.circular(AppSizes.radiusSm),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              const Icon(Icons.description_outlined, size: 18, color: AppColors.warning),
                              const SizedBox(width: 8),
                              Text('Justificante enviado', style: AppTextStyles.bodyMedium.copyWith(color: AppColors.warning)),
                            ],
                          ),
                          const SizedBox(height: 10),
                          _fila('Motivo', asistencia.justificante!.motivo),
                          const SizedBox(height: 6),
                          _fila('Estado', asistencia.justificante!.estado),
                        ],
                      ),
                    ),
                  ],
                ],
              ),
            ),
            const Spacer(),
            if (asistencia.puedeJustificar)
              BotonPrimario(
                texto: 'Enviar justificante',
                onPressed: () => _abrirModalJustificante(context),
                color: AppColors.warning,
                icono: Icons.edit_document,
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
          width: 100,
          child: Text(etiqueta, style: AppTextStyles.label),
        ),
        Expanded(child: Text(valor, style: AppTextStyles.body)),
      ],
    );
  }
}
