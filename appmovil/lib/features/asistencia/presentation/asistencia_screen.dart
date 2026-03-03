import 'package:flutter/material.dart';
import '../../../shared/widgets/app_loader.dart';
import '../data/asistencia_models.dart';
import '../data/asistencia_repository.dart';
import 'detalle_dia_screen.dart';
import 'widgets/asistencia_item.dart';

class AsistenciaScreen extends StatefulWidget {
  const AsistenciaScreen({super.key});

  @override
  State<AsistenciaScreen> createState() => _AsistenciaScreenState();
}

class _AsistenciaScreenState extends State<AsistenciaScreen> {
  final _repo = AsistenciaRepository();

  List<EstudianteModelo> _estudiantes = [];
  EstudianteModelo? _hijoSeleccionado;
  List<AsistenciaModelo> _historial = [];

  bool _cargandoHijos = true;
  bool _cargandoHistorial = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _cargarEstudiantes();
  }

  Future<void> _cargarEstudiantes() async {
    try {
      final lista = await _repo.obtenerEstudiantes();
      setState(() {
        _estudiantes = lista;
        _cargandoHijos = false;
      });
      if (lista.isNotEmpty) {
        _seleccionarHijo(lista.first);
      }
    } catch (e) {
      setState(() {
        _error = e.toString();
        _cargandoHijos = false;
      });
    }
  }

  Future<void> _seleccionarHijo(EstudianteModelo hijo) async {
    setState(() {
      _hijoSeleccionado = hijo;
      _cargandoHistorial = true;
      _error = null;
    });

    try {
      final historial = await _repo.obtenerHistorial(hijo.idEstudiante);
      setState(() {
        _historial = historial;
        _cargandoHistorial = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _cargandoHistorial = false;
      });
    }
  }

  void _irDetalleDia(AsistenciaModelo asistencia) async {
    final resultado = await Navigator.of(context).push<bool>(
      MaterialPageRoute(
        builder: (_) => DetalleDiaScreen(asistencia: asistencia),
      ),
    );
    if (resultado == true && _hijoSeleccionado != null) {
      _seleccionarHijo(_hijoSeleccionado!);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_cargandoHijos) {
      return const CargadorApp(mensaje: 'Cargando hijos...');
    }

    if (_error != null && _estudiantes.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.error_outline, size: 48, color: Colors.red.shade300),
              const SizedBox(height: 12),
              Text(_error!, textAlign: TextAlign.center),
            ],
          ),
        ),
      );
    }

    if (_estudiantes.isEmpty) {
      return const Center(
        child: Text('No tienes hijos vinculados a tu cuenta.'),
      );
    }

    return Column(
      children: [
        Container(
          width: double.infinity,
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
          child: DropdownButtonFormField<int>(
            initialValue: _hijoSeleccionado?.idEstudiante,
            decoration: const InputDecoration(
              labelText: 'Seleccionar hijo',
              border: OutlineInputBorder(),
              contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            ),
            items: _estudiantes.map((e) {
              return DropdownMenuItem(
                value: e.idEstudiante,
                child: Text(e.nombreCompleto),
              );
            }).toList(),
            onChanged: (id) {
              if (id == null) return;
              final hijo = _estudiantes.firstWhere((e) => e.idEstudiante == id);
              _seleccionarHijo(hijo);
            },
          ),
        ),
        if (_cargandoHistorial)
          const Expanded(child: CargadorApp(mensaje: 'Cargando historial...'))
        else if (_error != null && _historial.isEmpty)
          Expanded(
            child: Center(
              child: Text(_error!, textAlign: TextAlign.center),
            ),
          )
        else if (_historial.isEmpty)
          const Expanded(
            child: Center(
              child: Text('No hay registros de asistencia aun.'),
            ),
          )
        else
          Expanded(
            child: RefreshIndicator(
              onRefresh: () => _seleccionarHijo(_hijoSeleccionado!),
              child: ListView.builder(
                padding: const EdgeInsets.only(top: 8, bottom: 16),
                itemCount: _historial.length,
                itemBuilder: (context, i) {
                  final a = _historial[i];
                  return AsistenciaItem(
                    asistencia: a,
                    onTap: a.puedeJustificar ? () => _irDetalleDia(a) : null,
                  );
                },
              ),
            ),
          ),
      ],
    );
  }
}
