import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/storage/secure_storage.dart';
import '../../../core/theme/app_theme.dart';
import '../../../providers/hijos_provider.dart';
import '../../../providers/asistencia_access_provider.dart';
import '../../auth/data/auth_repository.dart';
import '../../auth/presentation/login_screen.dart';
import '../../chat/presentation/chat_screen.dart';
import '../../asistencia/presentation/asistencia_screen.dart';
import '../../asistencia/data/asistencia_repository.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen>
    with SingleTickerProviderStateMixin {
  late final TabController _tabCtrl;
  final _asistenciaRepo = AsistenciaRepository();
  String _nombre = '';

  @override
  void initState() {
    super.initState();
    _tabCtrl = TabController(length: 2, vsync: this);
    _cargarNombre();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) context.read<HijosProvider>().cargarHijos();
    });
  }

  Future<void> _cargarNombre() async {
    final nombre = await AlmacenamientoSeguro.obtenerNombre();
    if (mounted) setState(() => _nombre = nombre ?? 'Padre');
  }

  String get _primerNombre {
    final parts = _nombre.trim().split(' ');
    return parts.first;
  }

  String get _inicial {
    return _nombre.isNotEmpty ? _nombre[0].toUpperCase() : 'P';
  }

  Future<void> _cerrarSesion() async {
    final confirmar = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Cerrar sesion', style: AppTextStyles.heading3),
        content: Text('¿Quieres cerrar tu sesion?', style: AppTextStyles.body),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: Text(
              'Cancelar',
              style: AppTextStyles.bodyMedium.copyWith(
                color: AppColors.textSecondary,
              ),
            ),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: Text(
              'Cerrar sesion',
              style: AppTextStyles.bodyMedium.copyWith(color: AppColors.error),
            ),
          ),
        ],
      ),
    );

    if (confirmar != true) return;

    await AuthRepository().cerrarSesion();
    if (!mounted) return;
    context.read<HijosProvider>().limpiar();
    context.read<AsistenciaAccessProvider>().revocarAcceso();
    Navigator.of(context).pushAndRemoveUntil(
      MaterialPageRoute(builder: (_) => const LoginScreen()),
      (_) => false,
    );
  }

  Future<void> _abrirNotificaciones() async {
    List<Map<String, dynamic>> items = [];
    try {
      items = await _asistenciaRepo.obtenerNotificaciones();
    } catch (_) {
      // ignore
    }
    if (!mounted) return;

    await showDialog<void>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Notificaciones'),
        content: SizedBox(
          width: 420,
          child: items.isEmpty
              ? const Text('No hay notificaciones por ahora.')
              : ListView.separated(
                  shrinkWrap: true,
                  itemCount: items.length,
                  separatorBuilder: (_, __) => const Divider(height: 1),
                  itemBuilder: (_, i) {
                    final n = items[i];
                    final estado = n['estado'] ?? 'pendiente';
                    final estudiante =
                        (n['asistencia']?['estudiante']?['nombre_completo'] ??
                                'Estudiante')
                            .toString();
                    final revisadoEn = n['revisado_en']?.toString() ?? '';
                    return ListTile(
                      dense: true,
                      title: Text('Justificante $estado'),
                      subtitle: Text('$estudiante\n$revisadoEn'),
                    );
                  },
                ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cerrar'),
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _tabCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            _buildHeader(),
            _buildTabs(),
            Expanded(
              child: TabBarView(
                controller: _tabCtrl,
                children: const [ChatScreen(), AsistenciaScreen()],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      padding: const EdgeInsets.fromLTRB(20, 16, 16, 12),
      color: AppColors.surface,
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [AppColors.primary, AppColors.primaryLight],
              ),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Center(
              child: Text(
                _inicial,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Hola, $_primerNombre', style: AppTextStyles.heading3),
                const SizedBox(height: 2),
                Text('Portal de padres', style: AppTextStyles.caption),
              ],
            ),
          ),
          IconButton(
            onPressed: _abrirNotificaciones,
            icon: const Icon(Icons.notifications_none_rounded, size: 22),
            style: IconButton.styleFrom(
              foregroundColor: AppColors.textTertiary,
              backgroundColor: AppColors.surfaceAlt,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              fixedSize: const Size(40, 40),
            ),
          ),
          const SizedBox(width: 8),
          IconButton(
            onPressed: _cerrarSesion,
            icon: const Icon(Icons.logout_rounded, size: 22),
            style: IconButton.styleFrom(
              foregroundColor: AppColors.textTertiary,
              backgroundColor: AppColors.surfaceAlt,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              fixedSize: const Size(40, 40),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTabs() {
    return Container(
      color: AppColors.surface,
      padding: const EdgeInsets.fromLTRB(20, 0, 20, 12),
      child: Container(
        height: 44,
        decoration: BoxDecoration(
          color: AppColors.surfaceAlt,
          borderRadius: BorderRadius.circular(AppSizes.radiusSm),
        ),
        child: TabBar(
          controller: _tabCtrl,
          labelColor: AppColors.textOnPrimary,
          unselectedLabelColor: AppColors.textSecondary,
          labelStyle: AppTextStyles.bodyMedium,
          unselectedLabelStyle: AppTextStyles.body.copyWith(
            color: AppColors.textSecondary,
          ),
          indicator: BoxDecoration(
            color: AppColors.primary,
            borderRadius: BorderRadius.circular(AppSizes.radiusSm),
          ),
          indicatorSize: TabBarIndicatorSize.tab,
          dividerColor: Colors.transparent,
          indicatorPadding: const EdgeInsets.all(3),
          tabs: const [
            Tab(text: 'Chat IA'),
            Tab(text: 'Asistencia'),
          ],
        ),
      ),
    );
  }
}
