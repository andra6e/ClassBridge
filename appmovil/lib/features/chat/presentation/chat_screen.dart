import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/theme/app_theme.dart';
import '../../../providers/hijos_provider.dart';
import '../../../shared/widgets/app_loader.dart';
import '../../asistencia/data/asistencia_models.dart';
import '../../asistencia/data/asistencia_repository.dart';
import '../data/chat_models.dart';
import '../data/chat_repository.dart';
import 'widgets/message_bubble.dart';
import 'widgets/quick_actions.dart';

class ChatScreen extends StatefulWidget {
  const ChatScreen({super.key});

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final _asistenciaRepo = AsistenciaRepository();
  final _chatRepo = ChatRepository();
  final _mensajeCtrl = TextEditingController();
  final _scrollCtrl = ScrollController();

  List<ContenidoPendienteModelo> _contenidos = [];
  ContenidoPendienteModelo? _contenidoSeleccionado;
  int? _idConversacion;

  final List<MensajeChat> _mensajes = [];
  bool _cargandoContenidos = false;
  bool _enviando = false;

  int? _ultimoHijoId;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final provider = context.watch<HijosProvider>();
    final nuevo = provider.hijoSeleccionado;

    if (nuevo != null && nuevo.idEstudiante != _ultimoHijoId) {
      _ultimoHijoId = nuevo.idEstudiante;
      _cargarContenidos(nuevo.idEstudiante);
    }
  }

  Future<void> _cargarContenidos(int idEstudiante) async {
    setState(() {
      _cargandoContenidos = true;
      _contenidoSeleccionado = null;
      _contenidos = [];
      _mensajes.clear();
      _idConversacion = null;
    });

    try {
      final contenidos = await _asistenciaRepo.obtenerContenidoPendiente(idEstudiante);
      if (mounted) {
        setState(() {
          _contenidos = contenidos;
          _cargandoContenidos = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _cargandoContenidos = false);
    }
  }

  Future<void> _seleccionarContenido(ContenidoPendienteModelo contenido) async {
    setState(() {
      _contenidoSeleccionado = contenido;
      _mensajes.clear();
      _idConversacion = null;
    });

    final provider = context.read<HijosProvider>();
    if (provider.hijoSeleccionado == null) return;

    try {
      final data = await _chatRepo.iniciarConversacion(
        idEstudiante: provider.hijoSeleccionado!.idEstudiante,
        idContenido: contenido.idContenido,
      );

      final conv = data['conversacion'] as Map<String, dynamic>;
      final mensajesJson = data['mensajes'] as List<dynamic>? ?? [];

      setState(() {
        _idConversacion = conv['id_conversacion'];
        _mensajes.addAll(mensajesJson.map((m) => MensajeChat.fromJson(m)));
      });
    } catch (e) {
      setState(() {
        _mensajes.add(MensajeChat(texto: 'Error al iniciar conversacion: $e', esUsuario: false));
      });
    }
  }

  Future<void> _enviarMensaje(String texto) async {
    if (texto.trim().isEmpty || _idConversacion == null) return;

    final msg = texto.trim();
    _mensajeCtrl.clear();

    setState(() {
      _mensajes.add(MensajeChat(texto: msg, esUsuario: true));
      _enviando = true;
    });
    _scrollAbajo();

    try {
      final respuesta = await _chatRepo.enviarMensaje(
        idConversacion: _idConversacion!,
        mensaje: msg,
      );
      setState(() {
        _mensajes.add(MensajeChat(texto: respuesta, esUsuario: false));
      });
    } catch (e) {
      setState(() {
        _mensajes.add(MensajeChat(texto: 'Error: $e', esUsuario: false));
      });
    } finally {
      setState(() => _enviando = false);
      _scrollAbajo();
    }
  }

  void _scrollAbajo() {
    Future.delayed(const Duration(milliseconds: 100), () {
      if (_scrollCtrl.hasClients) {
        _scrollCtrl.animateTo(
          _scrollCtrl.position.maxScrollExtent,
          duration: const Duration(milliseconds: 250),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  void dispose() {
    _mensajeCtrl.dispose();
    _scrollCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<HijosProvider>();

    if (provider.cargando) return const CargadorApp(mensaje: 'Cargando...');
    if (provider.hijos.isEmpty) {
      return Center(child: Text('No tienes hijos vinculados.', style: AppTextStyles.bodySm));
    }

    return Column(
      children: [
        _buildSelectores(),
        Expanded(child: _buildChat()),
        if (_idConversacion != null) ...[
          AccionesRapidas(onSeleccionar: _enviarMensaje),
          _buildInputMensaje(),
        ],
      ],
    );
  }

  Widget _buildSelectores() {
    final provider = context.watch<HijosProvider>();

    return Container(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
      decoration: const BoxDecoration(
        color: AppColors.surface,
        border: Border(bottom: BorderSide(color: AppColors.borderLight)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          _buildSelectorHijo(provider),
          const SizedBox(height: 10),
          if (_cargandoContenidos)
            ClipRRect(
              borderRadius: BorderRadius.circular(4),
              child: LinearProgressIndicator(
                minHeight: 3,
                color: AppColors.primary,
                backgroundColor: AppColors.primarySoft,
              ),
            )
          else
            _buildSelectorTema(),
        ],
      ),
    );
  }

  Widget _buildSelectorHijo(HijosProvider provider) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
      decoration: BoxDecoration(
        color: AppColors.surfaceAlt,
        borderRadius: BorderRadius.circular(AppSizes.radiusSm),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<int>(
          value: provider.hijoSeleccionado?.idEstudiante,
          isExpanded: true,
          icon: const Icon(Icons.keyboard_arrow_down_rounded, color: AppColors.textSecondary),
          style: AppTextStyles.bodyMedium,
          hint: Text('Seleccionar hijo', style: AppTextStyles.body.copyWith(color: AppColors.textTertiary)),
          items: provider.hijos.map((e) {
            return DropdownMenuItem(
              value: e.idEstudiante,
              child: Row(
                children: [
                  Container(
                    width: 28,
                    height: 28,
                    decoration: BoxDecoration(
                      color: AppColors.primarySoft,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Center(
                      child: Text(
                        e.nombreCompleto.isNotEmpty ? e.nombreCompleto[0].toUpperCase() : '?',
                        style: AppTextStyles.bodySm.copyWith(color: AppColors.primary, fontWeight: FontWeight.w600),
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(child: Text(e.nombreCompleto, overflow: TextOverflow.ellipsis)),
                ],
              ),
            );
          }).toList(),
          onChanged: (id) {
            if (id == null) return;
            final hijo = provider.hijos.firstWhere((e) => e.idEstudiante == id);
            provider.seleccionarHijo(hijo);
          },
        ),
      ),
    );
  }

  Widget _buildSelectorTema() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
      decoration: BoxDecoration(
        color: AppColors.surfaceAlt,
        borderRadius: BorderRadius.circular(AppSizes.radiusSm),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<int>(
          value: _contenidoSeleccionado?.idContenido,
          isExpanded: true,
          icon: const Icon(Icons.keyboard_arrow_down_rounded, color: AppColors.textSecondary),
          style: AppTextStyles.bodyMedium,
          hint: Text('Seleccionar tema de clase', style: AppTextStyles.body.copyWith(color: AppColors.textTertiary)),
          items: _contenidos.map((c) {
            final label = '${c.materiaNombre}: ${c.tema}';
            return DropdownMenuItem(
              value: c.idContenido,
              child: Text(label, overflow: TextOverflow.ellipsis),
            );
          }).toList(),
          onChanged: (id) {
            if (id == null) return;
            final contenido = _contenidos.firstWhere((c) => c.idContenido == id);
            _seleccionarContenido(contenido);
          },
        ),
      ),
    );
  }

  Widget _buildChat() {
    if (_contenidoSeleccionado == null) {
      return _buildEstadoVacio();
    }

    if (_mensajes.isEmpty) {
      return _buildEstadoInicial();
    }

    return ListView.builder(
      controller: _scrollCtrl,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      itemCount: _mensajes.length + (_enviando ? 1 : 0),
      itemBuilder: (context, i) {
        if (i == _mensajes.length && _enviando) {
          return Padding(
            padding: const EdgeInsets.symmetric(vertical: 8),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppColors.aiSoft,
                    borderRadius: BorderRadius.circular(AppSizes.radiusSm),
                  ),
                  child: SizedBox(
                    width: 48,
                    height: 4,
                    child: LinearProgressIndicator(
                      borderRadius: BorderRadius.circular(2),
                      color: AppColors.aiAccent,
                      backgroundColor: AppColors.aiAccent.withValues(alpha: 0.2),
                    ),
                  ),
                ),
              ],
            ),
          );
        }
        return BurbujaMensaje(texto: _mensajes[i].texto, esUsuario: _mensajes[i].esUsuario);
      },
    );
  }

  Widget _buildEstadoVacio() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 72,
              height: 72,
              decoration: BoxDecoration(
                color: AppColors.aiSoft,
                borderRadius: BorderRadius.circular(20),
              ),
              child: const Icon(Icons.auto_awesome_rounded, size: 32, color: AppColors.aiAccent),
            ),
            const SizedBox(height: 20),
            Text(
              _contenidos.isEmpty
                  ? 'No hay contenido pendiente'
                  : 'Selecciona un tema',
              style: AppTextStyles.heading3,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              _contenidos.isEmpty
                  ? 'Cuando tu hijo tenga clases, podras consultarlas aqui.'
                  : 'Elige un tema de clase para comenzar a chatear con la IA.',
              style: AppTextStyles.bodySm,
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEstadoInicial() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 72,
              height: 72,
              decoration: BoxDecoration(
                color: AppColors.aiSoft,
                borderRadius: BorderRadius.circular(20),
              ),
              child: const Icon(Icons.chat_rounded, size: 32, color: AppColors.aiAccent),
            ),
            const SizedBox(height: 20),
            Text(
              '¿En que te puedo ayudar?',
              style: AppTextStyles.heading3,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              decoration: BoxDecoration(
                color: AppColors.surfaceAlt,
                borderRadius: BorderRadius.circular(AppSizes.radiusSm),
              ),
              child: Text(
                _contenidoSeleccionado!.tema,
                style: AppTextStyles.bodyMedium.copyWith(color: AppColors.primary),
                textAlign: TextAlign.center,
              ),
            ),
            const SizedBox(height: 12),
            Text(
              'Usa las acciones rapidas o escribe tu pregunta',
              style: AppTextStyles.caption,
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInputMensaje() {
    return Container(
      padding: EdgeInsets.fromLTRB(12, 8, 8, MediaQuery.of(context).padding.bottom + 8),
      decoration: BoxDecoration(
        color: AppColors.surface,
        boxShadow: [
          BoxShadow(
            color: AppColors.shadow,
            blurRadius: 8,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: Row(
        children: [
          Expanded(
            child: Container(
              decoration: BoxDecoration(
                color: AppColors.surfaceAlt,
                borderRadius: BorderRadius.circular(AppSizes.radiusLg),
              ),
              child: TextField(
                controller: _mensajeCtrl,
                textInputAction: TextInputAction.send,
                maxLines: 3,
                minLines: 1,
                style: AppTextStyles.body,
                onSubmitted: _enviando ? null : (_) => _enviarMensaje(_mensajeCtrl.text),
                decoration: InputDecoration(
                  hintText: 'Escribe tu pregunta...',
                  hintStyle: AppTextStyles.body.copyWith(color: AppColors.textTertiary),
                  border: InputBorder.none,
                  contentPadding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
                ),
              ),
            ),
          ),
          const SizedBox(width: 8),
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: _enviando ? AppColors.surfaceAlt : AppColors.primary,
              borderRadius: BorderRadius.circular(AppSizes.radiusSm),
            ),
            child: IconButton(
              onPressed: _enviando ? null : () => _enviarMensaje(_mensajeCtrl.text),
              icon: Icon(
                Icons.arrow_upward_rounded,
                color: _enviando ? AppColors.textTertiary : Colors.white,
                size: 22,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
