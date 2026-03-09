import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'features/auth/presentation/login_screen.dart';
import 'features/home/presentation/home_screen.dart';
import 'core/storage/secure_storage.dart';
import 'core/theme/app_theme.dart';
import 'providers/hijos_provider.dart';
import 'providers/asistencia_access_provider.dart';

class ClassBridgeApp extends StatelessWidget {
  const ClassBridgeApp({super.key});

  Future<bool> _verificarSesion() async {
    final token = await AlmacenamientoSeguro.obtenerAccessToken();
    return token != null;
  }

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => HijosProvider()),
        ChangeNotifierProvider(create: (_) => AsistenciaAccessProvider()),
      ],
      child: MaterialApp(
        title: 'ClassBridge',
        debugShowCheckedModeBanner: false,
        theme: buildAppTheme(),
        home: FutureBuilder<bool>(
          future: _verificarSesion(),
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) {
              return const Scaffold(
                body: Center(child: CircularProgressIndicator()),
              );
            }
            if (snapshot.data == true) {
              return const HomeScreen();
            }
            return const LoginScreen();
          },
        ),
      ),
    );
  }
}
