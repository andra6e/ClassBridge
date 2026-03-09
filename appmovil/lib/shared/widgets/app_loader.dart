import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';

class CargadorApp extends StatelessWidget {
  final String? mensaje;

  const CargadorApp({super.key, this.mensaje});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          SizedBox(
            width: 40,
            height: 40,
            child: CircularProgressIndicator(
              strokeWidth: 3,
              color: AppColors.primary.withValues(alpha: 0.7),
            ),
          ),
          if (mensaje != null) ...[
            const SizedBox(height: 20),
            Text(mensaje!, style: AppTextStyles.bodySm),
          ],
        ],
      ),
    );
  }
}
