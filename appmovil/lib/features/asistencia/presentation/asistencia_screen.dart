import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/theme/app_theme.dart';
import '../../../providers/hijos_provider.dart';
import '../../../providers/asistencia_access_provider.dart';
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
  final _contrasenaCtrl = TextEditingController();
  bool _mostrarContrasena = false;
  bool _verificando = false;
  String? _errorVerificacion;
  final _repo = AsistenciaRepository();

  List<AsistenciaModelo> _historial = [];
  bool _cargandoHistorial = false;
  String? _errorHistorial;

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

  Future<void> _verificarYAcceder() async {
    final contrasena = _contrasenaCtrl.text;
    if (contrasena.isEmpty) {
      setState(() => _errorVerificacion = 'Ingresa tu contraseña');
      return;
    }

    setState(() {
      _verificando = true;
      _errorVerificacion = null;
    });

    try {
      await context.read<AsistenciaAccessProvider>().verificarContrasena(contrasena);
      if (mounted) {
        _contrasenaCtrl.clear();
        setState(() => _verificando = false);
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorVerificacion = e.toString().replaceFirst('ErrorApi: ', '');
          _verificando = false;
        });
      }
    } finally {
      if (mounted && _verificando) setState(() => _verificando = false);
    }
  }

  void _irDetalleDia(AsistenciaModelo asistencia) async {
    final resultado = await Navigator.of(context).push<bool>(
      MaterialPageRoute(builder: (_) => DetalleDiaScreen(asistencia: asistencia)),
    );
    if (resultado == true && _ultimoHijoId != null) {
      _cargarHistorial(_ultimoHijoId!);
    }
  }

  int get _presentes => _historial.where((a) => a.estado == 'presente').length;
  int get _ausentes => _historial.where((a) => a.esAusente).length;
  int get _justificados => _historial.where((a) => a.tieneJustificante).length;

  @override
  void dispose() {
    _contrasenaCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<HijosProvider>();
    final accesoProvider = context.watch<AsistenciaAccessProvider>();

    if (!accesoProvider.accesoVerificado) {
      return _buildPantallaVerificacion();
    }

    if (provider.cargando) {
      return const CargadorApp(mensaje: 'Cargando hijos...');
    }

    if (provider.error != null && provider.hijos.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.errorSoft,
                  borderRadius: BorderRadius.circular(16),
                ),
                child: const Icon(Icons.error_outline, size: 32, color: AppColors.error),
              ),
              const SizedBox(height: 16),
              Text(provider.error!, textAlign: TextAlign.center, style: AppTextStyles.bodySm),
            ],
          ),
        ),
      );
    }

    if (provider.hijos.isEmpty) {
      return Center(
        child: Text('No tienes hijos vinculados a tu cuenta.', style: AppTextStyles.bodySm),
      );
    }

    return Column(
      children: [
        _buildSelectorHijo(provider),
        if (_cargandoHistorial)
          const Expanded(child: CargadorApp(mensaje: 'Cargando historial...'))
        else if (_errorHistorial != null && _historial.isEmpty)
          Expanded(
            child: Center(
              child: Text(_errorHistorial!, textAlign: TextAlign.center, style: AppTextStyles.bodySm),
            ),
          )
        else if (_historial.isEmpty)
          Expanded(
            child: Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: AppColors.surfaceAlt,
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: const Icon(Icons.event_note_outlined, size: 32, color: AppColors.textTertiary),
                  ),
                  const SizedBox(height: 16),
                  Text('No hay registros de asistencia aun.', style: AppTextStyles.bodySm),
                ],
              ),
            ),
          )
        else ...[
          _buildResumen(),
          Expanded(
            child: RefreshIndicator(
              onRefresh: () => _cargarHistorial(_ultimoHijoId!),
              color: AppColors.primary,
              child: ListView.builder(
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                itemCount: _historial.length,
                itemBuilder: (context, i) {
                  final a = _historial[i];
                  return AsistenciaItem(
                    asistencia: a,
                    onTap: a.esAusente ? () => _irDetalleDia(a) : null,
                  );
                },
              ),
            ),
          ),
        ],
      ],
    );
  }

  Widget _buildSelectorHijo(HijosProvider provider) {
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
      decoration: const BoxDecoration(
        color: AppColors.surface,
        border: Border(bottom: BorderSide(color: AppColors.borderLight)),
      ),
      child: Container(
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
            items: provider.hijos.map((e) {
              return DropdownMenuItem(
                value: e.idEstudiante,
                child: Text(e.nombreCompleto, overflow: TextOverflow.ellipsis),
              );
            }).toList(),
            onChanged: (id) {
              if (id == null) return;
              final hijo = provider.hijos.firstWhere((e) => e.idEstudiante == id);
              provider.seleccionarHijo(hijo);
            },
          ),
        ),
      ),
    );
  }

  Widget _buildResumen() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
      child: Row(
        children: [
          _buildResumenChip('Presente', _presentes, AppColors.success, AppColors.successSoft),
          const SizedBox(width: 8),
          _buildResumenChip('Ausente', _ausentes, AppColors.error, AppColors.errorSoft),
          const SizedBox(width: 8),
          _buildResumenChip('Justificado', _justificados, AppColors.warning, AppColors.warningSoft),
        ],
      ),
    );
  }

  Widget _buildResumenChip(String label, int count, Color color, Color bg) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color: bg,
          borderRadius: BorderRadius.circular(AppSizes.radiusSm),
        ),
        child: Column(
          children: [
            Text(
              '$count',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w700,
                color: color,
              ),
            ),
            const SizedBox(height: 2),
            Text(label, style: AppTextStyles.caption.copyWith(color: color)),
          ],
        ),
      ),
    );
  }

  Widget _buildPantallaVerificacion() {
    return Center(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(28),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Container(
              width: 72,
              height: 72,
              decoration: BoxDecoration(
                color: AppColors.surfaceAlt,
                borderRadius: BorderRadius.circular(20),
              ),
              child: const Icon(Icons.shield_outlined, size: 32, color: AppColors.primary),
            ),
            const SizedBox(height: 24),
            Text(
              'Verificacion de identidad',
              style: AppTextStyles.heading2,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 12),
            Text(
              'Ingresa tu contraseña para acceder a la asistencia y justificantes.',
              style: AppTextStyles.bodySm,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 32),
            if (_errorVerificacion != null) ...[
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: AppColors.errorSoft,
                  borderRadius: BorderRadius.circular(AppSizes.radiusSm),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.error_outline, size: 18, color: AppColors.error),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        _errorVerificacion!,
                        style: AppTextStyles.bodySm.copyWith(color: AppColors.error),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
            ],
            Text('CONTRASEÑA', style: AppTextStyles.label),
            const SizedBox(height: 8),
            TextField(
              controller: _contrasenaCtrl,
              obscureText: !_mostrarContrasena,
              enabled: !_verificando,
              style: AppTextStyles.body,
              decoration: InputDecoration(
                hintText: '••••••••',
                suffixIcon: IconButton(
                  icon: Icon(
                    _mostrarContrasena ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                    size: 20,
                    color: AppColors.textTertiary,
                  ),
                  onPressed: () => setState(() => _mostrarContrasena = !_mostrarContrasena),
                ),
              ),
              onSubmitted: (_) => _verificarYAcceder(),
            ),
            const SizedBox(height: 24),
            SizedBox(
              height: 52,
              child: FilledButton(
                onPressed: _verificando ? null : _verificarYAcceder,
                style: FilledButton.styleFrom(
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(AppSizes.radiusMd),
                  ),
                ),
                child: _verificando
                    ? const SizedBox(
                        height: 22,
                        width: 22,
                        child: CircularProgressIndicator(strokeWidth: 2.5, color: Colors.white),
                      )
                    : Text('Verificar y continuar', style: AppTextStyles.button.copyWith(color: Colors.white)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
