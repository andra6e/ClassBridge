# Documentacion de Endpoints - API ClassBridge

Base URL: `http://localhost:3000/api`

Formato de respuesta estandar:
```json
{ "ok": true|false, "mensaje": "string", "data": any }
```

---

## Autenticacion

### POST /api/auth/login
Login para usuarios (admin/maestro).

**Rate limit:** 5 intentos / 1 min

**Body:**
```json
{ "correo": "maestra@classbridge.com", "contrasena": "Maestro123!" }
```

**Respuesta exitosa (200):**
```json
{
  "ok": true,
  "mensaje": "Login exitoso",
  "data": {
    "tokens": { "accessToken": "...", "refreshToken": "..." },
    "usuario": { "id_usuario": 2, "nombre_completo": "...", "correo": "...", "rol": "maestro", "id_escuela": 1 }
  }
}
```

---

### POST /api/auth/login-padre
Login para padres/tutores.

**Rate limit:** 5 intentos / 1 min

**Body:**
```json
{ "correo": "padre@classbridge.com", "contrasena": "Padre123!" }
```

**Respuesta exitosa (200):**
```json
{
  "ok": true,
  "mensaje": "Login exitoso",
  "data": {
    "tokens": { "accessToken": "...", "refreshToken": "..." },
    "padre": { "id_padre": 1, "nombre_completo": "...", "correo": "...", "id_escuela": 1 }
  }
}
```

---

### POST /api/auth/refresh
Renueva tokens usando el refresh token.

**Body:**
```json
{ "refresh_token": "eyJhbGci..." }
```

**Respuesta (200):**
```json
{
  "ok": true,
  "mensaje": "Token renovado",
  "data": { "tokens": { "accessToken": "...", "refreshToken": "..." } }
}
```

---

### POST /api/auth/logout
Revoca el refresh token.

**Body:**
```json
{ "refresh_token": "eyJhbGci..." }
```

**Respuesta (200):**
```json
{ "ok": true, "mensaje": "Sesion cerrada", "data": null }
```

---

## Grupos (Maestro)

**Auth requerida:** Bearer token de usuario con rol `maestro` o `admin`

### GET /api/grupos
Lista los grupos del maestro autenticado.

**Respuesta (200):**
```json
{
  "ok": true,
  "mensaje": "Grupos del maestro",
  "data": [
    { "id_grupo": 1, "nombre": "5-A Matematicas", "materia": "Matematicas", "nivel_grado": "5to Primaria", "anio_escolar": "2025-2026", "activo": true }
  ]
}
```

---

### GET /api/grupos/:id_grupo/estudiantes
Lista estudiantes inscritos en un grupo del maestro.

**Respuesta (200):**
```json
{
  "ok": true,
  "mensaje": "Estudiantes del grupo",
  "data": {
    "grupo": { "id_grupo": 1, "nombre": "5-A Matematicas", "materia": "Matematicas" },
    "estudiantes": [
      { "id_estudiante": 1, "nombre_completo": "Sofia Hernandez Martinez", "codigo_matricula": "MAT-2026-001", "InscripcionGrupo": { "inscrito_en": "...", "retirado_en": null } }
    ]
  }
}
```

---

## Asistencia (Maestro)

**Auth requerida:** Bearer token de usuario con rol `maestro` o `admin`

### POST /api/asistencia/guardar
Guarda asistencia masiva para un grupo en una fecha. Crea la sesion automaticamente si no existe.

**Body:**
```json
{
  "id_grupo": 1,
  "fecha_sesion": "2026-02-24",
  "registros": [
    { "id_estudiante": 1, "estado": "presente", "notas": null },
    { "id_estudiante": 2, "estado": "ausente", "notas": "Enfermo" }
  ]
}
```

**Estados validos:** `presente`, `ausente`, `tarde`, `justificado`

**Respuesta (200):**
```json
{
  "ok": true,
  "mensaje": "Asistencia guardada",
  "data": {
    "id_sesion": 1,
    "fecha_sesion": "2026-02-24",
    "total": 2,
    "resumen": { "presentes": 1, "ausentes": 1, "tardes": 0, "justificados": 0 }
  }
}
```

---

## Contenido (Maestro)

**Auth requerida:** Bearer token de usuario con rol `maestro` o `admin`

### POST /api/contenido
Crea o actualiza el contenido del dia para una sesion (upsert por id_sesion).

**Body:**
```json
{
  "id_sesion": 1,
  "titulo": "Fracciones equivalentes",
  "resumen": "Hoy aprendimos a identificar fracciones equivalentes...",
  "notas_extra": "Tarea: pagina 45"
}
```

**Respuesta (200):**
```json
{
  "ok": true,
  "mensaje": "Contenido guardado",
  "data": { "id_contenido": 1, "id_sesion": 1, "titulo": "...", "resumen": "...", "notas_extra": "...", "subido_por": 2 }
}
```

---

## Adjuntos (Maestro)

**Auth requerida:** Bearer token de usuario con rol `maestro` o `admin`

### POST /api/adjuntos
Crea un adjunto tipo enlace para un contenido existente.

**Body:**
```json
{
  "id_contenido": 1,
  "nombre_archivo": "Guia de fracciones",
  "tipo_archivo": "enlace",
  "url_archivo": "https://ejemplo.com/guia.pdf",
  "tamano_kb": null
}
```

**Respuesta (201):**
```json
{
  "ok": true,
  "mensaje": "Adjunto creado",
  "data": { "id_adjunto": 1, "id_contenido": 1, "nombre_archivo": "...", "url_archivo": "..." }
}
```

---

## Padres

**Auth requerida:** Bearer token de padre

### GET /api/padres/estudiantes
Lista los hijos vinculados al padre autenticado.

**Respuesta (200):**
```json
{
  "ok": true,
  "mensaje": "Hijos del padre",
  "data": [
    { "id_estudiante": 1, "nombre_completo": "Sofia Hernandez Martinez", "codigo_matricula": "MAT-2026-001", "PadreEstudiante": { "relacion": "padre", "es_principal": true } }
  ]
}
```

---

### GET /api/estudiantes/:id_estudiante/asistencia
Historial de asistencia de un hijo vinculado al padre. Incluye sesion, grupo y justificante.

**Query params opcionales:** `?limite=50`

**Respuesta (200):**
```json
{
  "ok": true,
  "mensaje": "Historial de asistencia",
  "data": [
    {
      "id_asistencia": 1, "estado": "justificado", "notas": "Enfermo", "registrado_en": "...",
      "sesion": { "id_sesion": 1, "fecha_sesion": "2026-02-24", "grupo": { "nombre": "5-A Matematicas", "materia": "Matematicas" } },
      "justificante": { "id_justificante": 1, "motivo": "...", "estado": "aprobado" }
    }
  ]
}
```

---

## Justificantes

### POST /api/justificantes
**Auth:** Padre. Envia justificante para una asistencia de un hijo vinculado.

**Body:**
```json
{
  "id_asistencia": 1,
  "motivo": "Mi hija tuvo fiebre y no pudo asistir.",
  "url_adjunto": null,
  "nombre_adjunto": null
}
```

**Respuesta (201):**
```json
{
  "ok": true,
  "mensaje": "Justificante enviado",
  "data": { "id_justificante": 1, "id_asistencia": 1, "motivo": "...", "estado": "pendiente" }
}
```

---

### GET /api/justificantes/pendientes
**Auth:** Maestro. Lista justificantes pendientes de estudiantes en sus grupos.

**Respuesta (200):**
```json
{
  "ok": true,
  "mensaje": "Justificantes pendientes",
  "data": [
    {
      "id_justificante": 1, "motivo": "...", "estado": "pendiente", "enviado_en": "...",
      "asistencia": { "id_asistencia": 1, "estudiante": { "nombre_completo": "..." }, "sesion": { "fecha_sesion": "2026-02-24", "grupo": { "nombre": "5-A Matematicas" } } },
      "padre": { "nombre_completo": "Roberto Hernandez Perez" }
    }
  ]
}
```

---

### POST /api/justificantes/:id_justificante/revisar
**Auth:** Maestro. Aprueba o rechaza un justificante. Si aprueba, la asistencia cambia a "justificado".

**Body:**
```json
{ "estado": "aprobado", "notas_revision": "Constancia medica recibida." }
```

**Respuesta (200):**
```json
{
  "ok": true,
  "mensaje": "Justificante aprobado",
  "data": { "id_justificante": 1, "estado": "aprobado", "revisado_por": 2, "revisado_en": "..." }
}
```

---

## IA / Chat Educativo

**Auth requerida:** Bearer token de padre
**Rate limit:** 20 solicitudes / 1 min
**Proveedor:** Google Gemini (gemini-2.5-flash por defecto, configurable via GEMINI_MODEL) o fallback simulado

### POST /api/ia/chat
Chat educativo basado en el contenido de una sesion. El sistema valida que el estudiante esta vinculado al padre y que esta inscrito en el grupo de la sesion. Carga el contenido de la clase (titulo, resumen, notas_extra) y los textos extraidos de adjuntos para construir un prompt educativo contextualizado.

**Body:**
```json
{
  "id_estudiante": 1,
  "id_sesion": 1,
  "mensaje": "Explicame la multiplicacion"
}
```

Validaciones:
- `id_estudiante`: numero entero positivo (requerido)
- `id_sesion`: numero entero positivo (requerido)
- `mensaje`: string, minimo 3 caracteres, maximo 2000 (requerido)

**Respuesta exitosa (200) con Gemini:**
```json
{
  "ok": true,
  "mensaje": "Respuesta generada",
  "data": {
    "respuesta": "La multiplicacion es una operacion matematica que consiste en sumar un numero consigo mismo varias veces...",
    "contexto_usado": {
      "materia": "Matematicas",
      "tema": "Fracciones equivalentes",
      "fecha_sesion": "2026-02-24",
      "proveedor": "gemini"
    }
  }
}
```

**Respuesta sin proveedor configurado (200):**
```json
{
  "ok": true,
  "mensaje": "Respuesta generada",
  "data": {
    "respuesta": "[Sin proveedor IA configurado]\n\nTema: Fracciones equivalentes\n...",
    "contexto_usado": {
      "materia": "Matematicas",
      "tema": "Fracciones equivalentes",
      "fecha_sesion": "2026-02-24",
      "proveedor": "ninguno"
    }
  }
}
```

**Errores posibles:**
- 403: Estudiante no vinculado al padre, o no inscrito en el grupo
- 404: Sesion no encontrada, o sin contenido disponible
- 502: Error al comunicarse con el proveedor de IA

**Proveedores soportados (variable IA_PROVIDER):**
- `gemini` — Google Gemini (gemini-1.5-flash), implementado y funcional
- `openai` — OpenAI (preparado, pendiente de implementacion)
- Vacio o no configurado — respuesta de fallback informativa

---

## Codigos de error comunes

| Codigo | Significado |
|--------|-------------|
| 400    | Error de validacion (body incorrecto) |
| 401    | No autenticado / Token invalido o expirado |
| 403    | Sin permisos (rol incorrecto o recurso ajeno) |
| 404    | Recurso no encontrado |
| 409    | Registro duplicado |
| 429    | Demasiadas solicitudes (rate limit) |
| 500    | Error interno del servidor |
