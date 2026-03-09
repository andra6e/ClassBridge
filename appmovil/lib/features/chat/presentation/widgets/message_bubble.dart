import 'package:flutter/material.dart';
import 'package:flutter_markdown/flutter_markdown.dart';
import 'package:flutter_markdown_latex/flutter_markdown_latex.dart';
import 'package:markdown/markdown.dart' as md;
import '../../../../core/theme/app_theme.dart';

final _markdownWithLatex = md.ExtensionSet(
  [
    ...md.ExtensionSet.gitHubFlavored.blockSyntaxes,
    LatexBlockSyntax(),
  ],
  [
    ...md.ExtensionSet.gitHubFlavored.inlineSyntaxes,
    LatexInlineSyntax(),
  ],
);

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
    final colorFondo = esUsuario ? AppColors.primary : AppColors.surface;
    final colorTexto = esUsuario ? Colors.white : AppColors.textPrimary;
    final alineacion = esUsuario ? CrossAxisAlignment.end : CrossAxisAlignment.start;

    final baseStyle = TextStyle(
      color: colorTexto,
      fontSize: 15.5,
      height: 1.5,
    );

    final styleSheet = MarkdownStyleSheet(
      p: baseStyle,
      strong: baseStyle.copyWith(fontWeight: FontWeight.w700),
      em: baseStyle.copyWith(fontStyle: FontStyle.italic),
      listBullet: baseStyle,
      blockquote: baseStyle.copyWith(color: colorTexto.withValues(alpha: 0.85)),
      code: baseStyle.copyWith(
        fontFamily: 'monospace',
        fontSize: 14,
        backgroundColor: (esUsuario ? Colors.white : AppColors.textPrimary).withValues(alpha: 0.12),
      ),
      blockquoteDecoration: BoxDecoration(
        border: Border(left: BorderSide(color: colorTexto.withValues(alpha: 0.3), width: 3)),
      ),
    );

    return Container(
      margin: const EdgeInsets.symmetric(vertical: 3),
      child: Column(
        crossAxisAlignment: alineacion,
        children: [
          if (!esUsuario) ...[
            Padding(
              padding: const EdgeInsets.only(left: 4, bottom: 4),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 20,
                    height: 20,
                    decoration: BoxDecoration(
                      color: AppColors.aiSoft,
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: const Icon(Icons.auto_awesome, size: 12, color: AppColors.aiAccent),
                  ),
                  const SizedBox(width: 6),
                  Text('ClassBridge IA', style: AppTextStyles.caption.copyWith(fontWeight: FontWeight.w600)),
                ],
              ),
            ),
          ],
          Container(
            constraints: BoxConstraints(
              maxWidth: MediaQuery.of(context).size.width * 0.82,
            ),
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: colorFondo,
              borderRadius: BorderRadius.only(
                topLeft: const Radius.circular(18),
                topRight: const Radius.circular(18),
                bottomLeft: Radius.circular(esUsuario ? 18 : 4),
                bottomRight: Radius.circular(esUsuario ? 4 : 18),
              ),
              boxShadow: esUsuario ? null : AppShadows.soft,
            ),
            child: MarkdownBody(
              selectable: true,
              data: texto,
              styleSheet: styleSheet,
              builders: {
                'latex': LatexElementBuilder(
                  textStyle: baseStyle,
                  textScaleFactor: 1.0,
                ),
              },
              extensionSet: _markdownWithLatex,
            ),
          ),
        ],
      ),
    );
  }
}
