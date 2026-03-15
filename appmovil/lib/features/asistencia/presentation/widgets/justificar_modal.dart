import 'package:flutter/material.dart';
import 'dart:convert';
import 'package:file_picker/file_picker.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../shared/widgets/primary_button.dart';

class ArchivoAdjunto {
  final String nombre;
  final String mime;
  final String base64;

  ArchivoAdjunto({
    required this.nombre,
    required this.mime,
    required this.base64,
  });

  Map<String, dynamic> toJson() => {
    'nombre': nombre,
    'mime': mime,
    'base64': base64,
  };
}

class JustificarModal extends StatefulWidget {
  final String fecha;
  final Future<void> Function(String motivo, ArchivoAdjunto? archivo) onEnviar;

  const JustificarModal({
    super.key,
    required this.fecha,
    required this.onEnviar,
  });

  @override
  State<JustificarModal> createState() => _JustificarModalState();
}

class _JustificarModalState extends State<JustificarModal> {
  final _motivoCtrl = TextEditingController();
  bool _enviando = false;
  String? _error;
  ArchivoAdjunto? _archivo;

  Future<void> _seleccionarArchivo() async {
    final resultado = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['pdf', 'jpg', 'jpeg', 'png'],
      withData: true,
    );
    if (resultado == null || resultado.files.isEmpty) return;
    final f = resultado.files.first;
    if (f.bytes == null) return;

    final ext = (f.extension ?? '').toLowerCase();
    String mime = 'application/octet-stream';
    if (ext == 'pdf') mime = 'application/pdf';
    if (ext == 'jpg' || ext == 'jpeg') mime = 'image/jpeg';
    if (ext == 'png') mime = 'image/png';

    setState(() {
      _archivo = ArchivoAdjunto(
        nombre: f.name,
        mime: mime,
        base64: base64Encode(f.bytes!),
      );
    });
  }

  Future<void> _enviar() async {
    final motivo = _motivoCtrl.text.trim();
    if (motivo.isEmpty) {
      setState(() => _error = 'Escribe el motivo de la ausencia');
      return;
    }

    setState(() {
      _enviando = true;
      _error = null;
    });

    try {
      await widget.onEnviar(motivo, _archivo);
      if (mounted) Navigator.of(context).pop(true);
    } catch (e) {
      if (mounted) setState(() => _error = e.toString());
    } finally {
      if (mounted) setState(() => _enviando = false);
    }
  }

  @override
  void dispose() {
    _motivoCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      padding: EdgeInsets.only(
        left: 24,
        right: 24,
        top: 16,
        bottom: MediaQuery.of(context).viewInsets.bottom + 24,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Center(
            child: Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: AppColors.border,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const SizedBox(height: 20),
          Text('Enviar justificante', style: AppTextStyles.heading3),
          const SizedBox(height: 6),
          Text('Fecha: ${widget.fecha}', style: AppTextStyles.caption),
          const SizedBox(height: 20),
          if (_error != null) ...[
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.errorSoft,
                borderRadius: BorderRadius.circular(AppSizes.radiusSm),
              ),
              child: Row(
                children: [
                  const Icon(
                    Icons.error_outline,
                    size: 18,
                    color: AppColors.error,
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      _error!,
                      style: AppTextStyles.bodySm.copyWith(
                        color: AppColors.error,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
          ],
          Text('MOTIVO', style: AppTextStyles.label),
          const SizedBox(height: 8),
          TextField(
            controller: _motivoCtrl,
            maxLines: 3,
            textInputAction: TextInputAction.done,
            style: AppTextStyles.body,
            decoration: InputDecoration(
              hintText: 'Describe el motivo de la ausencia...',
              hintStyle: AppTextStyles.body.copyWith(
                color: AppColors.textTertiary,
              ),
              alignLabelWithHint: true,
            ),
          ),
          const SizedBox(height: 12),
          Align(
            alignment: Alignment.centerLeft,
            child: TextButton.icon(
              onPressed: _enviando ? null : _seleccionarArchivo,
              icon: const Icon(Icons.attach_file),
              label: Text(
                _archivo == null
                    ? 'Adjuntar PDF o imagen (opcional)'
                    : _archivo!.nombre,
              ),
            ),
          ),
          const SizedBox(height: 24),
          BotonPrimario(
            texto: 'Enviar justificante',
            cargando: _enviando,
            onPressed: _enviar,
            icono: Icons.send_rounded,
          ),
        ],
      ),
    );
  }
}
