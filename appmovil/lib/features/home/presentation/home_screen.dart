import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/storage/secure_storage.dart';
import '../../../providers/hijos_provider.dart';
import '../../auth/data/auth_repository.dart';
import '../../auth/presentation/login_screen.dart';
import '../../chat/presentation/chat_screen.dart';
import '../../asistencia/presentation/asistencia_screen.dart';
import 'widgets/top_tabs.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen>
    with SingleTickerProviderStateMixin {
  late final TabController _tabCtrl;
  String _nombre = '';

  @override
  void initState() {
    super.initState();
    _tabCtrl = TabController(length: 2, vsync: this);
    _cargarNombre();
    // Cargar hijos una sola vez al entrar al Home
    Future.microtask(() => context.read<HijosProvider>().cargarHijos());
  }

  Future<void> _cargarNombre() async {
    final nombre = await AlmacenamientoSeguro.obtenerNombre();
    if (mounted) setState(() => _nombre = nombre ?? 'Padre');
  }

  Future<void> _cerrarSesion() async {
    final confirmar = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Cerrar sesion'),
        content: const Text('Quieres cerrar tu sesion?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancelar'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Cerrar sesion'),
          ),
        ],
      ),
    );

    if (confirmar != true) return;

    await AuthRepository().cerrarSesion();
    if (!mounted) return;
    context.read<HijosProvider>().limpiar();
    Navigator.of(context).pushAndRemoveUntil(
      MaterialPageRoute(builder: (_) => const LoginScreen()),
      (_) => false,
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
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'ClassBridge',
              style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold),
            ),
            Text(
              _nombre,
              style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            tooltip: 'Cerrar sesion',
            onPressed: _cerrarSesion,
          ),
        ],
        bottom: TopTabs(controlador: _tabCtrl),
      ),
      body: TabBarView(
        controller: _tabCtrl,
        children: const [ChatScreen(), AsistenciaScreen()],
      ),
    );
  }
}
