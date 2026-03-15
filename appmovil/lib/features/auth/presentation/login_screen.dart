import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/utils/validators.dart';
import '../../../shared/widgets/primary_button.dart';
import '../data/auth_repository.dart';
import '../../home/presentation/home_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _correoCtrl = TextEditingController();
  final _contrasenaCtrl = TextEditingController();
  final _repo = AuthRepository();

  bool _cargando = false;
  String? _error;
  bool _mostrarContrasena = false;

  Future<void> _iniciarSesion() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _cargando = true;
      _error = null;
    });

    try {
      await _repo.login(
        _correoCtrl.text.trim(),
        _contrasenaCtrl.text,
      );
      if (!mounted) return;
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => const HomeScreen()),
      );
    } catch (e) {
      final msg = e.toString().replaceFirst('ErrorApi: ', '').replaceFirst('Exception: ', '');
      setState(() => _error = msg);
    } finally {
      if (mounted) setState(() => _cargando = false);
    }
  }

  @override
  void dispose() {
    _correoCtrl.dispose();
    _contrasenaCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.surface,
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 28),
            child: Form(
              key: _formKey,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const SizedBox(height: 40),
                  Container(
                    width: 72,
                    height: 72,
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                        colors: [AppColors.primary, AppColors.primaryLight],
                      ),
                      borderRadius: BorderRadius.circular(20),
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.primary.withValues(alpha: 0.3),
                          blurRadius: 20,
                          offset: const Offset(0, 8),
                        ),
                      ],
                    ),
                    child: const Icon(Icons.school_rounded, size: 36, color: Colors.white),
                  ),
                  const SizedBox(height: 28),
                  Text('Bienvenido a', style: AppTextStyles.body.copyWith(color: AppColors.textSecondary)),
                  const SizedBox(height: 4),
                  const Text('ClassBridge', style: AppTextStyles.heading1),
                  const SizedBox(height: 8),
                  Text(
                    'Inicia sesion para acompañar el aprendizaje de tu hijo',
                    style: AppTextStyles.bodySm,
                  ),
                  const SizedBox(height: 40),
                  if (_error != null) ...[
                    Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: AppColors.errorSoft,
                        borderRadius: BorderRadius.circular(AppSizes.radiusSm),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.error_outline, size: 20, color: AppColors.error),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Text(
                              _error!,
                              style: AppTextStyles.bodySm.copyWith(color: AppColors.error),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 20),
                  ],
                  Text('CORREO ELECTRONICO', style: AppTextStyles.label),
                  const SizedBox(height: 8),
                  TextFormField(
                    controller: _correoCtrl,
                    keyboardType: TextInputType.emailAddress,
                    textInputAction: TextInputAction.next,
                    validator: Validadores.correo,
                    style: AppTextStyles.body,
                    decoration: const InputDecoration(
                      hintText: 'tucorreo@ejemplo.com',
                      prefixIcon: Icon(Icons.email_outlined, size: 20),
                    ),
                  ),
                  const SizedBox(height: 20),
                  Text('CONTRASEÑA', style: AppTextStyles.label),
                  const SizedBox(height: 8),
                  TextFormField(
                    controller: _contrasenaCtrl,
                    obscureText: !_mostrarContrasena,
                    textInputAction: TextInputAction.done,
                    validator: Validadores.contrasena,
                    onFieldSubmitted: (_) => _iniciarSesion(),
                    style: AppTextStyles.body,
                    decoration: InputDecoration(
                      hintText: '••••••••',
                      prefixIcon: const Icon(Icons.lock_outline, size: 20),
                      suffixIcon: IconButton(
                        icon: Icon(
                          _mostrarContrasena ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                          size: 20,
                          color: AppColors.textTertiary,
                        ),
                        onPressed: () => setState(() => _mostrarContrasena = !_mostrarContrasena),
                      ),
                    ),
                  ),
                  const SizedBox(height: 32),
                  BotonPrimario(
                    texto: 'Iniciar sesion',
                    cargando: _cargando,
                    onPressed: _iniciarSesion,
                  ),
                  const SizedBox(height: 40),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
