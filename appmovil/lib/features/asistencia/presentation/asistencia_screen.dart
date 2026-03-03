import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../providers/hijos_provider.dart';
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

  List<AsistenciaModelo> _historial = [];
  bool _cargandoHistorial = false;
  String? _errorHistorial;

  /// Guardamos el id del hijo para detectar cambios en didChangeDependencies.
  int? _ultimoHijoId;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final provider = context.watch<HijosProvider>();
    final nuevo = provider.hijoSeleccionado;

    if (nuevo != null && nuevo.idEstudiante != _ultimoHijoId) {
      _ultimoHijoId = nuevo.idEstudiante;
      _cargarHistorial(nuevo.idEstudiante);
    }
  }

  Future<void> _cargarHistorial(int idEstudiante) async {
    setState(() {
      _cargandoHistorial = true;
      _errorHistorial = null;
    });

    try {
      final historial = await _repo.obtenerHistorial(idEstudiante);
      if (mounted) {
        setState(() {
          _historial = historial;
          _cargandoHistorial = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorHistorial = e.toString();
          _cargandoHistorial = false;
        });
      }
    }
  }

  void _irDetalleDia(AsistenciaModelo asistencia) async {
    final resultado = await Navigator.of(context).push<bool>(
      MaterialPageRoute(
        builder: (_) => DetalleDiaScreen(asistencia: asistencia),
      ),
    );
    if (resultado == true && _ultimoHijoId != null) {
      _cargarHistorial(_ultimoHijoId!);
    }
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<HijosProvider>();

    // Estado: cargando hijos
    if (provider.cargando) {
      return const CargadorApp(mensaje: 'Cargando hijos...');
    }

    // Estado: error al cargar hijos
    if (provider.error != null && provider.hijos.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.error_outline, size: 48, color: Colors.red.shade300),
              const SizedBox(height: 12),
              Text(provider.error!, textAlign: TextAlign.center),
            ],
          ),
        ),
      );
    }

    // Estado: sin hijos
    if (provider.hijos.isEmpty) {
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
            value: provider.hijoSeleccionado?.idEstudiante,
            decoration: const InputDecoration(
              labelText: 'Seleccionar hijo',
              border: OutlineInputBorder(),
              contentPadding: EdgeInsets.symmetric(
                horizontal: 12,
                vertical: 10,
              ),
            ),
            items: provider.hijos.map((e) {
              return DropdownMenuItem(
                value: e.idEstudiante,
                child: Text(e.nombreCompleto),
              );
            }).toList(),
            onChanged: (id) {
              if (id == null) return;
              final hijo = provider.hijos.firstWhere(
                (e) => e.idEstudiante == id,
              );
              provider.seleccionarHijo(hijo);
            },
          ),
        ),
        if (_cargandoHistorial)
          const Expanded(child: CargadorApp(mensaje: 'Cargando historial...'))
        else if (_errorHistorial != null && _historial.isEmpty)
          Expanded(
            child: Center(
              child: Text(_errorHistorial!, textAlign: TextAlign.center),
            ),
          )
        else if (_historial.isEmpty)
          const Expanded(
            child: Center(child: Text('No hay registros de asistencia aun.')),
          )
        else
          Expanded(
            child: RefreshIndicator(
              onRefresh: () => _cargarHistorial(_ultimoHijoId!),
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
