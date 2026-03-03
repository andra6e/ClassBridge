import 'package:flutter/material.dart';
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

  List<EstudianteModelo> _estudiantes = [];
  EstudianteModelo? _hijoSeleccionado;

  List<AsistenciaModelo> _sesiones = [];
  AsistenciaModelo? _sesionSeleccionada;

  final List<MensajeChat> _mensajes = [];
  bool _cargandoHijos = true;
  bool _cargandoSesiones = false;
  bool _enviando = false;

  @override
  void initState() {
    super.initState();
    _cargarEstudiantes();
  }

  Future<void> _cargarEstudiantes() async {
    try {
      final lista = await _asistenciaRepo.obtenerEstudiantes();
      setState(() {
        _estudiantes = lista;
        _cargandoHijos = false;
      });
      if (lista.isNotEmpty) {
        _seleccionarHijo(lista.first);
      }
    } catch (_) {
      setState(() {
        _cargandoHijos = false;
      });
    }
  }

  Future<void> _seleccionarHijo(EstudianteModelo hijo) async {
    setState(() {
      _hijoSeleccionado = hijo;
      _cargandoSesiones = true;
      _sesionSeleccionada = null;
      _sesiones = [];
      _mensajes.clear();
    });

    try {
      final historial = await _asistenciaRepo.obtenerHistorial(hijo.idEstudiante);
      final conSesion = historial.where((a) => a.sesion != null).toList();
      setState(() {
        _sesiones = conSesion;
        _cargandoSesiones = false;
        if (conSesion.isNotEmpty) {
          _sesionSeleccionada = conSesion.first;
        }
      });
    } catch (_) {
      setState(() {
        _cargandoSesiones = false;
      });
    }
  }

  Future<void> _enviarMensaje(String texto) async {
    if (texto.trim().isEmpty) return;
    if (_hijoSeleccionado == null || _sesionSeleccionada == null) return;

    final msg = texto.trim();
    _mensajeCtrl.clear();

    setState(() {
      _mensajes.add(MensajeChat(texto: msg, esUsuario: true));
      _enviando = true;
    });
    _scrollAbajo();

    try {
      final respuesta = await _chatRepo.enviarMensaje(
        idEstudiante: _hijoSeleccionado!.idEstudiante,
        idSesion: _sesionSeleccionada!.sesion!.idSesion,
        mensaje: msg,
      );
      setState(() {
        _mensajes.add(MensajeChat(texto: respuesta, esUsuario: false));
      });
    } catch (e) {
      setState(() {
        _mensajes.add(MensajeChat(
          texto: 'Error: $e',
          esUsuario: false,
        ));
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
    if (_cargandoHijos) {
      return const CargadorApp(mensaje: 'Cargando...');
    }

    if (_estudiantes.isEmpty) {
      return const Center(
        child: Text('No tienes hijos vinculados.'),
      );
    }

    return Column(
      children: [
        _buildSelectores(),
        const Divider(height: 1),
        Expanded(child: _buildChat()),
        if (_sesionSeleccionada != null) ...[
          AccionesRapidas(onSeleccionar: _enviarMensaje),
          const SizedBox(height: 4),
          _buildInputMensaje(),
        ],
      ],
    );
  }

  Widget _buildSelectores() {
    return Container(
      padding: const EdgeInsets.fromLTRB(12, 8, 12, 8),
      color: Colors.grey.shade50,
      child: Column(
        children: [
          DropdownButtonFormField<int>(
            initialValue: _hijoSeleccionado?.idEstudiante,
            decoration: const InputDecoration(
              labelText: 'Hijo',
              border: OutlineInputBorder(),
              contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              isDense: true,
            ),
            items: _estudiantes.map((e) {
              return DropdownMenuItem(
                value: e.idEstudiante,
                child: Text(e.nombreCompleto, overflow: TextOverflow.ellipsis),
              );
            }).toList(),
            onChanged: (id) {
              if (id == null) return;
              final hijo = _estudiantes.firstWhere((e) => e.idEstudiante == id);
              _seleccionarHijo(hijo);
            },
          ),
          const SizedBox(height: 8),
          if (_cargandoSesiones)
            const LinearProgressIndicator()
          else
            DropdownButtonFormField<int>(
              initialValue: _sesionSeleccionada?.idAsistencia,
              decoration: const InputDecoration(
                labelText: 'Sesion / Fecha',
                border: OutlineInputBorder(),
                contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                isDense: true,
              ),
              items: _sesiones.map((a) {
                final label =
                    '${a.fechaFormateada} - ${a.materiaGrupo}';
                return DropdownMenuItem(
                  value: a.idAsistencia,
                  child: Text(label, overflow: TextOverflow.ellipsis),
                );
              }).toList(),
              onChanged: (id) {
                if (id == null) return;
                setState(() {
                  _sesionSeleccionada =
                      _sesiones.firstWhere((a) => a.idAsistencia == id);
                  _mensajes.clear();
                });
              },
            ),
        ],
      ),
    );
  }

  Widget _buildChat() {
    if (_sesionSeleccionada == null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Text(
            _sesiones.isEmpty
                ? 'No hay sesiones disponibles para este hijo.'
                : 'Selecciona una sesion para comenzar.',
            textAlign: TextAlign.center,
            style: TextStyle(color: Colors.grey.shade500),
          ),
        ),
      );
    }

    if (_mensajes.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                Icons.chat_bubble_outline,
                size: 56,
                color: Colors.grey.shade300,
              ),
              const SizedBox(height: 12),
              Text(
                'Pregunta lo que necesites sobre la clase',
                textAlign: TextAlign.center,
                style: TextStyle(
                  color: Colors.grey.shade500,
                  fontSize: 15,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                'Usa las acciones rapidas o escribe tu pregunta',
                textAlign: TextAlign.center,
                style: TextStyle(
                  color: Colors.grey.shade400,
                  fontSize: 13,
                ),
              ),
            ],
          ),
        ),
      );
    }

    return ListView.builder(
      controller: _scrollCtrl,
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      itemCount: _mensajes.length + (_enviando ? 1 : 0),
      itemBuilder: (context, i) {
        if (i == _mensajes.length && _enviando) {
          return const Padding(
            padding: EdgeInsets.symmetric(vertical: 8),
            child: Align(
              alignment: Alignment.centerLeft,
              child: SizedBox(
                width: 60,
                child: LinearProgressIndicator(),
              ),
            ),
          );
        }
        final msg = _mensajes[i];
        return BurbujaMensaje(texto: msg.texto, esUsuario: msg.esUsuario);
      },
    );
  }

  Widget _buildInputMensaje() {
    return Container(
      padding: EdgeInsets.only(
        left: 12,
        right: 8,
        top: 8,
        bottom: MediaQuery.of(context).padding.bottom + 8,
      ),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 4,
            offset: const Offset(0, -1),
          ),
        ],
      ),
      child: Row(
        children: [
          Expanded(
            child: TextField(
              controller: _mensajeCtrl,
              textInputAction: TextInputAction.send,
              maxLines: 3,
              minLines: 1,
              onSubmitted: _enviando ? null : (_) => _enviarMensaje(_mensajeCtrl.text),
              decoration: const InputDecoration(
                hintText: 'Escribe tu pregunta...',
                border: OutlineInputBorder(),
                contentPadding: EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                isDense: true,
              ),
            ),
          ),
          const SizedBox(width: 8),
          IconButton.filled(
            onPressed: _enviando
                ? null
                : () => _enviarMensaje(_mensajeCtrl.text),
            icon: const Icon(Icons.send),
          ),
        ],
      ),
    );
  }
}
