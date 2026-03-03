import 'package:flutter/material.dart';

class BurbujaMensaje extends StatelessWidget {
  final String texto;
  final bool esUsuario;

  const BurbujaMensaje({
    super.key,
    required this.texto,
    required this.esUsuario,
  });

  @override
  Widget build(BuildContext context) {
    final colorFondo = esUsuario
        ? Theme.of(context).colorScheme.primary
        : Colors.grey.shade100;
    final colorTexto = esUsuario ? Colors.white : Colors.black87;
    final alineacion =
        esUsuario ? CrossAxisAlignment.end : CrossAxisAlignment.start;

    return Container(
      margin: const EdgeInsets.symmetric(vertical: 4),
      child: Column(
        crossAxisAlignment: alineacion,
        children: [
          Container(
            constraints: BoxConstraints(
              maxWidth: MediaQuery.of(context).size.width * 0.78,
            ),
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            decoration: BoxDecoration(
              color: colorFondo,
              borderRadius: BorderRadius.only(
                topLeft: const Radius.circular(16),
                topRight: const Radius.circular(16),
                bottomLeft: Radius.circular(esUsuario ? 16 : 4),
                bottomRight: Radius.circular(esUsuario ? 4 : 16),
              ),
            ),
            child: SelectableText(
              texto,
              style: TextStyle(
                color: colorTexto,
                fontSize: 14.5,
                height: 1.4,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
