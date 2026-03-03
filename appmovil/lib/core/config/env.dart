// Exporta la configuracion segun plataforma.
// Android emulador: 10.0.2.2 | Windows/web: 127.0.0.1 o localhost
export 'env_config_io.dart'
    if (dart.library.html) 'env_config_web.dart';
