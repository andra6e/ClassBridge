import 'package:flutter/material.dart';
import '../../../../shared/widgets/primary_button.dart';

class JustificarModal extends StatefulWidget {
  final String fecha;
  final Future<void> Function(String motivo) onEnviar;

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
      await widget.onEnviar(motivo);
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
    return Padding(
      padding: EdgeInsets.only(
        left: 20,
        right: 20,
        top: 20,
        bottom: MediaQuery.of(context).viewInsets.bottom + 20,
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
                color: Colors.grey.shade300,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const SizedBox(height: 16),
          const Text(
            'Enviar justificante',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 4),
          Text(
            'Fecha: ${widget.fecha}',
            style: TextStyle(color: Colors.grey.shade600, fontSize: 13),
          ),
          const SizedBox(height: 16),
          if (_error != null) ...[
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: Colors.red.shade50,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: Colors.red.shade200),
              ),
              child: Text(
                _error!,
                style: TextStyle(color: Colors.red.shade700, fontSize: 13),
              ),
            ),
            const SizedBox(height: 12),
          ],
          TextField(
            controller: _motivoCtrl,
            maxLines: 3,
            textInputAction: TextInputAction.done,
            decoration: const InputDecoration(
              labelText: 'Motivo de la ausencia',
              hintText: 'Describe el motivo...',
              border: OutlineInputBorder(),
              alignLabelWithHint: true,
            ),
          ),
          const SizedBox(height: 20),
          BotonPrimario(
            texto: 'Enviar justificante',
            cargando: _enviando,
            onPressed: _enviar,
          ),
        ],
      ),
    );
  }
}
