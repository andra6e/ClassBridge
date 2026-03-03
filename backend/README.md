# ClassBridge - Backend

Backend del sistema escolar ClassBridge construido con Node.js, Express y Sequelize (MySQL).

## Requisitos previos

- Node.js >= 18
- MySQL >= 8.0
- npm >= 9

## Instalacion

```bash
cd backend
npm install
```

## Configuracion de entorno

Copia el archivo de ejemplo y ajusta las variables:

```bash
cp .env.example .env
```

Variables requeridas en `.env`:

| Variable              | Descripcion              | Ejemplo                          |
|-----------------------|--------------------------|----------------------------------|
| DB_HOST               | Host de MySQL            | localhost                        |
| DB_PORT               | Puerto de MySQL          | 3306                             |
| DB_USER               | Usuario de MySQL         | root                             |
| DB_PASSWORD           | Contrasena de MySQL      | (vacio para XAMPP)               |
| DB_NAME               | Nombre de la base        | classbridge                      |
| NODE_ENV              | Entorno de ejecucion     | development                      |
| PORT                  | Puerto del servidor      | 3000                             |
| ACCESS_TOKEN_SECRET   | Secreto JWT access       | cambia_este_secreto_access       |
| REFRESH_TOKEN_SECRET  | Secreto JWT refresh      | cambia_este_secreto_refresh      |
| IA_PROVIDER           | Proveedor IA             | openai / gemini (o vacio)        |
| OPENAI_API_KEY        | API key de OpenAI        | sk-...                           |
| GEMINI_API_KEY        | API key de Gemini        | (si aplica)                      |

## Base de datos

### Crear la base de datos manualmente

```sql
CREATE DATABASE IF NOT EXISTS classbridge
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

### Ejecutar migraciones

```bash
npm run db:migrate
```

### Ejecutar seeders (datos de prueba)

```bash
npm run db:seed
```

### Resetear todo (migraciones + seeders)

```bash
npm run db:reset
```

## Iniciar el servidor

```bash
npm run dev     # Desarrollo con nodemon (hot-reload)
npm start       # Produccion
```

El servidor estara disponible en `http://localhost:3000`.

## Endpoints de la API

Base URL: `http://localhost:3000/api`

La documentacion completa de endpoints esta en [src/docs/endpoints.md](src/docs/endpoints.md).

### Resumen de rutas

| Metodo | Ruta                                      | Auth       | Descripcion                          |
|--------|-------------------------------------------|------------|--------------------------------------|
| POST   | /api/auth/login                           | No         | Login admin/maestro                  |
| POST   | /api/auth/login-padre                     | No         | Login padre                          |
| POST   | /api/auth/refresh                         | No         | Renovar tokens                       |
| POST   | /api/auth/logout                          | No         | Cerrar sesion                        |
| GET    | /api/grupos                               | Maestro    | Listar grupos del maestro            |
| GET    | /api/grupos/:id_grupo/estudiantes         | Maestro    | Estudiantes de un grupo              |
| POST   | /api/asistencia/guardar                   | Maestro    | Guardar asistencia masiva            |
| POST   | /api/contenido                            | Maestro    | Crear/actualizar contenido sesion    |
| POST   | /api/adjuntos                             | Maestro    | Crear adjunto tipo enlace            |
| GET    | /api/justificantes/pendientes             | Maestro    | Justificantes pendientes             |
| POST   | /api/justificantes/:id/revisar            | Maestro    | Aprobar/rechazar justificante        |
| GET    | /api/padres/estudiantes                   | Padre      | Listar hijos del padre               |
| GET    | /api/estudiantes/:id/asistencia           | Padre      | Historial de asistencia del hijo     |
| POST   | /api/justificantes                        | Padre      | Enviar justificante de ausencia      |
| POST   | /api/ia/chat                              | Padre      | Chat educativo IA                    |

## Datos de prueba (seeders)

| Entidad      | Datos                                     | Credenciales                          |
|--------------|-------------------------------------------|---------------------------------------|
| Escuela      | Escuela Primaria Benito Juarez            | -                                     |
| Admin        | Carlos Lopez Rivera                       | admin@classbridge.com / Admin123!     |
| Maestro      | Maria Fernanda Garcia                     | maestra@classbridge.com / Maestro123! |
| Padre        | Roberto Hernandez Perez                   | padre@classbridge.com / Padre123!     |
| Estudiante   | Sofia Hernandez Martinez (MAT-2026-001)   | Sin login                             |
| Grupo        | 5-A Matematicas (2025-2026)               | -                                     |

## Estructura del proyecto

```
backend/
  .sequelizerc
  .env / .env.example
  package.json
  src/
    index.js              # Entry point (arranca servidor)
    app.js                # Configuracion Express (middleware, rutas)
    config/
      config.js           # Configuracion Sequelize por entorno
      db.js               # Instancia de conexion Sequelize
    database/
      index.js            # Registro de modelos y asociaciones
    models/               # 12 modelos Sequelize
    migrations/           # 12 migraciones
    seeders/              # Datos de prueba
    routes/               # Rutas organizadas por dominio
    controllers/          # Controladores (reciben request, llaman servicio)
    services/             # Logica de negocio con Sequelize
    middleware/            # Auth JWT, roles, errores, rate limit, validacion
    validators/           # Esquemas Zod de validacion
    utils/                # response.js, hash.js, logger.js
    docs/                 # Documentacion de endpoints
```

## Seguridad

- **JWT** con access token (15 min) y refresh token (7 dias)
- **Helmet** para headers de seguridad
- **CORS** configurado
- **Rate limiting** en /api/auth y /api/ia/chat
- **Control de acceso por rol**: maestro solo ve sus grupos; padre solo ve sus hijos
- **Validacion de entrada** con Zod en todos los endpoints
- **Manejo centralizado de errores**
