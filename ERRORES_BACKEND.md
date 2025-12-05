# Listado de Errores del Backend y Manejo en Frontend

Este documento lista todos los errores que puede retornar el backend y cómo el frontend debe manejarlos.

## Formato de Respuesta de Error

Todos los errores del backend siguen este formato estándar:

```json
{
  "success": false,
  "error": {
    "message": "Mensaje de error descriptivo",
    "stack": "Stack trace (solo en desarrollo)"
  }
}
```

## Códigos HTTP y Categorías

### 400 - Bad Request (Errores de Validación)

#### Autenticación

| Endpoint | Mensaje de Error | Manejo en Frontend |
|----------|------------------|-------------------|
| `POST /api/auth/register` | "La edad debe ser un número válido entre 1 y 120" | Mostrar mensaje de error en el campo de edad. Validar antes de enviar. |
| `POST /api/auth/register` | "El correo electrónico no es válido" | Mostrar error en campo email. Validar formato antes de enviar. |
| `POST /api/auth/register` | "La contraseña debe tener al menos 6 caracteres" | Mostrar error en campo contraseña. Validar longitud antes de enviar. |
| `POST /api/auth/register` | "Debe proporcionar un correo electrónico válido" | Mostrar error de validación en campo email. |
| `POST /api/auth/register` | "La contraseña debe tener al menos 6 caracteres" | Mostrar error de validación en campo contraseña. |
| `POST /api/auth/register` | "Los nombres son obligatorios" | Mostrar error en campo nombres. |
| `POST /api/auth/register` | "Los nombres deben tener entre 2 y 50 caracteres" | Mostrar error de validación en campo nombres. |
| `POST /api/auth/register` | "Los apellidos son obligatorios" | Mostrar error en campo apellidos. |
| `POST /api/auth/register` | "Los apellidos deben tener entre 2 y 50 caracteres" | Mostrar error de validación en campo apellidos. |
| `POST /api/auth/register` | "La edad debe ser un número entre 1 y 120" | Mostrar error de validación en campo edad. |
| `POST /api/auth/login` | "Email y contraseña son requeridos" | Mostrar error indicando que ambos campos son obligatorios. |
| `POST /api/auth/login` | "Debe proporcionar un correo electrónico válido" | Mostrar error de validación en campo email. |
| `POST /api/auth/login` | "La contraseña es requerida" | Mostrar error en campo contraseña. |
| `POST /api/auth/logout` | "No hay sesión activa" | Limpiar estado local y redirigir a login. No mostrar error crítico. |
| `POST /api/auth/reset-password` | "No existe una cuenta con este correo electrónico" | Mostrar mensaje informativo. No revelar si el email existe o no (consideración de seguridad). |
| `POST /api/auth/reset-password` | "Error al enviar el email de recuperación" | Mostrar mensaje genérico de error. |
| `POST /api/auth/confirm-password-reset` | "El código de recuperación es inválido" | Mostrar error en el campo del código. Permitir reintentar. |
| `POST /api/auth/confirm-password-reset` | "El enlace de recuperación ha expirado" | Mostrar mensaje claro y ofrecer opción de solicitar nuevo enlace. |
| `POST /api/auth/confirm-password-reset` | "La contraseña debe tener al menos 6 caracteres" | Mostrar error en campo nueva contraseña. |
| `POST /api/auth/confirm-password-reset` | "El enlace de recuperación es inválido o ha expirado" | Mostrar mensaje genérico. Ofrecer solicitar nuevo enlace. |
| `POST /api/auth/confirm-password-reset` | "El código de verificación es requerido" | Mostrar error de validación en campo código. |
| `POST /api/auth/confirm-password-reset` | "La nueva contraseña debe tener al menos 6 caracteres" | Mostrar error de validación en campo nueva contraseña. |
| `PUT /api/auth/update-password` | "La contraseña actual es incorrecta" | Mostrar error en campo contraseña actual. Permitir reintentar. |
| `PUT /api/auth/update-password` | "La nueva contraseña debe tener al menos 6 caracteres" | Mostrar error en campo nueva contraseña. |
| `PUT /api/auth/update-password` | "La contraseña actual es requerida" | Mostrar error de validación. |
| `PUT /api/auth/update-password` | "La confirmación de contraseña es requerida" | Mostrar error de validación. |
| `PUT /api/auth/update-password` | "Las contraseñas no coinciden" | Mostrar error indicando que las contraseñas deben coincidir. |

#### Usuarios

| Endpoint | Mensaje de Error | Manejo en Frontend |
|----------|------------------|-------------------|
| `PUT /api/users/profile` | "La edad debe ser un número válido entre 1 y 120" | Mostrar error en campo edad. Validar antes de enviar. |
| `PUT /api/users/profile` | "El correo electrónico no es válido" | Mostrar error en campo email. |
| `PUT /api/users/profile` | "Los nombres no pueden estar vacíos" | Mostrar error de validación. |
| `PUT /api/users/profile` | "Los nombres deben tener entre 2 y 50 caracteres" | Mostrar error de validación. |
| `PUT /api/users/profile` | "Los apellidos no pueden estar vacíos" | Mostrar error de validación. |
| `PUT /api/users/profile` | "Los apellidos deben tener entre 2 y 50 caracteres" | Mostrar error de validación. |
| `PUT /api/users/profile` | "La edad debe ser un número entre 1 y 120" | Mostrar error de validación. |
| `PUT /api/users/profile` | "Debe proporcionar un correo electrónico válido" | Mostrar error de validación. |

#### OAuth

| Endpoint | Mensaje de Error | Manejo en Frontend |
|----------|------------------|-------------------|
| `GET /api/auth/oauth/github` | "No email found in GitHub account" | Mostrar mensaje informativo. Solicitar al usuario que verifique su cuenta de GitHub tiene email público. |

### 401 - Unauthorized (Errores de Autenticación)

| Endpoint | Mensaje de Error | Manejo en Frontend |
|----------|------------------|-------------------|
| `POST /api/auth/login` | "Usuario no encontrado" | Mostrar mensaje genérico: "Credenciales incorrectas" (no revelar si el email existe). |
| `POST /api/auth/login` | "Contraseña incorrecta" | Mostrar mensaje genérico: "Credenciales incorrectas" (no revelar si el email existe). |
| `POST /api/auth/login` | "Usuario deshabilitado" | Mostrar mensaje claro. Contactar soporte si es necesario. |
| `POST /api/auth/login` | "Credenciales de inicio de sesión inválidas" | Mostrar mensaje genérico de error de autenticación. |
| `POST /api/auth/login` | "Error de autenticación" | Mostrar mensaje genérico. Permitir reintentar. |
| `POST /api/auth/update-password` | "Usuario no autenticado" | Redirigir a login. Limpiar estado de sesión. |
| `GET /api/users/profile` | "User not authenticated" | Redirigir a login. Limpiar cookies y estado local. |
| `PUT /api/users/profile` | "User not authenticated" | Redirigir a login. Limpiar cookies y estado local. |
| `DELETE /api/users/profile` | "User not authenticated" | Redirigir a login. Limpiar cookies y estado local. |
| `GET /api/users/:userId` | "User not authenticated" | Redirigir a login. Limpiar cookies y estado local. |
| `POST /api/meetings` | "User not authenticated" | Redirigir a login. Limpiar cookies y estado local. |
| `GET /api/meetings` | "User not authenticated" | Redirigir a login. Limpiar cookies y estado local. |
| `GET /api/meetings/:meetingId` | "User not authenticated" | Redirigir a login. Limpiar cookies y estado local. |
| `POST /api/meetings/:meetingId/join` | "User not authenticated" | Redirigir a login. Limpiar cookies y estado local. |
| `POST /api/meetings/:meetingId/leave` | "User not authenticated" | Redirigir a login. Limpiar cookies y estado local. |
| `DELETE /api/meetings/:meetingId` | "User not authenticated" | Redirigir a login. Limpiar cookies y estado local. |
| **Middleware de autenticación** | "No hay sesión activa. Por favor inicia sesión." | Redirigir a página de login. Mostrar mensaje informativo. |
| **Middleware de autenticación** | "Sesión expirada. Por favor inicia sesión nuevamente." | Redirigir a login. Limpiar estado local. Mostrar mensaje claro. |
| **Middleware de autenticación** | "Sesión revocada. Por favor inicia sesión nuevamente." | Redirigir a login. Limpiar estado local. Mostrar mensaje claro. |
| **Middleware de autenticación** | "Sesión inválida o expirada" | Redirigir a login. Limpiar estado local. |

### 403 - Forbidden (Errores de Autorización)

| Endpoint | Mensaje de Error | Manejo en Frontend |
|----------|------------------|-------------------|
| `POST /api/meetings/:meetingId/join` | "Meeting is full (maximum 10 participants)" | Mostrar mensaje claro. Deshabilitar botón de unirse. Mostrar número actual de participantes si está disponible. |
| `DELETE /api/meetings/:meetingId` | "Only the host can delete the meeting" | Mostrar mensaje de error. Ocultar o deshabilitar botón de eliminar si el usuario no es el host. |

### 404 - Not Found

| Endpoint | Mensaje de Error | Manejo en Frontend |
|----------|------------------|-------------------|
| `GET /api/users/profile` | "User not found" | Redirigir a registro o mostrar mensaje de error. Limpiar sesión. |
| `GET /api/users/:userId` | "User not found" | Mostrar mensaje "Usuario no encontrado". Redirigir a página anterior o lista de usuarios. |
| `GET /api/meetings/:meetingId` | "Meeting not found" | Mostrar mensaje "Reunión no encontrada". Redirigir a lista de reuniones. |
| `POST /api/meetings/:meetingId/join` | "Meeting not found" | Mostrar mensaje "Reunión no encontrada". Redirigir a lista de reuniones. |
| `POST /api/meetings/:meetingId/leave` | "Meeting not found" | Mostrar mensaje "Reunión no encontrada". Redirigir a lista de reuniones. |
| `DELETE /api/meetings/:meetingId` | "Meeting not found" | Mostrar mensaje "Reunión no encontrada". Redirigir a lista de reuniones. |
| `PUT /api/auth/update-password` | "Usuario no encontrado" | Redirigir a login. Limpiar sesión. |
| **Cualquier ruta no definida** | "Route {ruta} not found" | Mostrar página 404. Ofrecer navegación a páginas principales. |

### 409 - Conflict (Recursos Duplicados)

| Endpoint | Mensaje de Error | Manejo en Frontend |
|----------|------------------|-------------------|
| `POST /api/auth/register` | "El correo ya está registrado" | Mostrar error en campo email. Ofrecer opción de iniciar sesión o recuperar contraseña. |
| `PUT /api/users/profile` | "El correo ya está en uso" | Mostrar error en campo email. Sugerir usar otro email. |

### 500 - Internal Server Error (Errores del Servidor)

| Endpoint | Mensaje de Error | Manejo en Frontend |
|----------|------------------|-------------------|
| `POST /api/auth/register` | "Error al registrar usuario" | Mostrar mensaje genérico de error. Permitir reintentar. Registrar error para debugging. |
| `POST /api/auth/login` | "Error durante el inicio de sesión" | Mostrar mensaje genérico. Permitir reintentar. No revelar detalles técnicos. |
| `POST /api/auth/logout` | "Error durante el cierre de sesión" | Limpiar estado local de todas formas. Mostrar mensaje informativo si es necesario. |
| `POST /api/auth/reset-password` | "Error al procesar la solicitud de recuperación" | Mostrar mensaje genérico. Permitir reintentar. |
| `POST /api/auth/confirm-password-reset` | "Error al restablecer la contraseña" | Mostrar mensaje genérico. Permitir reintentar. |
| `GET /api/auth/oauth/google` | "Google OAuth not configured on server" | Mostrar mensaje de error. Contactar soporte. |
| `GET /api/auth/oauth/google` | "Failed to obtain id_token from Google" | Mostrar mensaje genérico. Permitir reintentar. |
| `GET /api/auth/oauth/google` | "Failed to verify Google id token" | Mostrar mensaje genérico. Permitir reintentar. |
| `GET /api/auth/oauth/google` | "Error creating or fetching Firebase user" | Mostrar mensaje genérico. Permitir reintentar. |
| `GET /api/auth/oauth/google` | "Error fetching Firebase user" | Mostrar mensaje genérico. Permitir reintentar. |
| `GET /api/auth/oauth/google` | "Missing FIREBASE_API_KEY for token exchange" | Mostrar mensaje de error. Contactar soporte. |
| `GET /api/auth/oauth/google` | "Failed to sign in with custom token" | Mostrar mensaje genérico. Permitir reintentar. |
| `GET /api/auth/oauth/google` | "Error during Google OAuth" | Mostrar mensaje genérico. Permitir reintentar. |
| `GET /api/auth/oauth/github` | "GitHub OAuth not configured on server" | Mostrar mensaje de error. Contactar soporte. |
| `GET /api/auth/oauth/github` | "Failed to obtain access token from GitHub" | Mostrar mensaje genérico. Permitir reintentar. |
| `GET /api/auth/oauth/github` | "Failed to get GitHub user profile" | Mostrar mensaje genérico. Permitir reintentar. |
| `GET /api/auth/oauth/github` | "Error creating or fetching Firebase user" | Mostrar mensaje genérico. Permitir reintentar. |
| `GET /api/auth/oauth/github` | "Error fetching Firebase user" | Mostrar mensaje genérico. Permitir reintentar. |
| `GET /api/auth/oauth/github` | "Missing FIREBASE_API_KEY for token exchange" | Mostrar mensaje de error. Contactar soporte. |
| `GET /api/auth/oauth/github` | "Failed to sign in with custom token" | Mostrar mensaje genérico. Permitir reintentar. |
| `GET /api/auth/oauth/github` | "Error during GitHub OAuth" | Mostrar mensaje genérico. Permitir reintentar. |
| `PUT /api/auth/update-password` | "Configuración del servidor incorrecta" | Mostrar mensaje de error. Contactar soporte. |
| `PUT /api/auth/update-password` | "Error al actualizar la contraseña" | Mostrar mensaje genérico. Permitir reintentar. |
| `GET /api/users/profile` | "Error fetching user profile" | Mostrar mensaje genérico. Permitir reintentar. |
| `PUT /api/users/profile` | "Error al actualizar el perfil" | Mostrar mensaje genérico. Permitir reintentar. |
| `DELETE /api/users/profile` | "Error deleting account" | Mostrar mensaje genérico. Permitir reintentar. |
| `GET /api/users/:userId` | "Error fetching user" | Mostrar mensaje genérico. Permitir reintentar. |
| `POST /api/meetings` | "Error creating meeting" | Mostrar mensaje genérico. Permitir reintentar. |
| `GET /api/meetings` | "Error fetching meetings" | Mostrar mensaje genérico. Permitir reintentar. |
| `GET /api/meetings/:meetingId` | "Error fetching meeting" | Mostrar mensaje genérico. Permitir reintentar. |
| `POST /api/meetings/:meetingId/join` | "Error joining meeting" | Mostrar mensaje genérico. Permitir reintentar. |
| `POST /api/meetings/:meetingId/leave` | "Error leaving meeting" | Mostrar mensaje genérico. Permitir reintentar. |
| `DELETE /api/meetings/:meetingId` | "Error deleting meeting" | Mostrar mensaje genérico. Permitir reintentar. |
| **Chat Proxy** | "Error from Chat Backend" | Mostrar mensaje genérico. Permitir reintentar. |
| **Chat Proxy** | "Error creating meeting" | Mostrar mensaje genérico. Permitir reintentar. |
| **Chat Proxy** | "Error fetching meetings" | Mostrar mensaje genérico. Permitir reintentar. |
| **Chat Proxy** | "Error fetching meeting" | Mostrar mensaje genérico. Permitir reintentar. |
| **Chat Proxy** | "Error joining meeting" | Mostrar mensaje genérico. Permitir reintentar. |
| **Chat Proxy** | "Error leaving meeting" | Mostrar mensaje genérico. Permitir reintentar. |
| **Chat Proxy** | "Error deleting meeting" | Mostrar mensaje genérico. Permitir reintentar. |
| **Chat Proxy** | "Error updating meeting" | Mostrar mensaje genérico. Permitir reintentar. |
| **Error Handler Global** | "Internal Server Error" | Mostrar mensaje genérico. No revelar detalles técnicos al usuario. Registrar error para debugging. |

## Manejo General de Errores en el Frontend

### 1. Interceptor HTTP

Implementar un interceptor que capture todas las respuestas de error:

```typescript
// Ejemplo de interceptor (Axios)
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const { status, data } = error.response || {};
    
    // Manejar errores 401 - Redirigir a login
    if (status === 401) {
      // Limpiar cookies, localStorage, etc.
      // Redirigir a /login
    }
    
    // Manejar errores 404 - Mostrar página 404
    if (status === 404) {
      // Redirigir a página 404
    }
    
    // Extraer mensaje de error
    const errorMessage = data?.error?.message || 'Error desconocido';
    
    // Mostrar notificación al usuario
    showNotification(errorMessage, 'error');
    
    return Promise.reject(error);
  }
);
```

### 2. Manejo de Errores por Categoría

#### Errores 400 (Validación)
- Mostrar mensajes de error específicos en los campos correspondientes
- Resaltar campos con errores visualmente
- No bloquear completamente el formulario, permitir corrección

#### Errores 401 (No Autenticado)
- Limpiar todas las cookies y estado local
- Redirigir inmediatamente a `/login`
- Mostrar mensaje: "Tu sesión ha expirado. Por favor inicia sesión nuevamente."

#### Errores 403 (No Autorizado)
- Mostrar mensaje claro de por qué no se puede realizar la acción
- Ocultar o deshabilitar elementos de UI que requieren permisos

#### Errores 404 (No Encontrado)
- Mostrar página 404 personalizada
- Ofrecer navegación a páginas principales
- Botón "Volver" o "Ir al inicio"

#### Errores 409 (Conflicto)
- Mostrar mensaje específico sobre el conflicto
- Ofrecer acciones alternativas (ej: "¿Ya tienes cuenta? Inicia sesión")

#### Errores 500 (Error del Servidor)
- Mostrar mensaje genérico: "Ha ocurrido un error. Por favor intenta nuevamente."
- Permitir reintentar la acción
- No revelar detalles técnicos al usuario
- Registrar error para debugging

### 3. Notificaciones de Error

Implementar un sistema de notificaciones consistente:

```typescript
// Ejemplo de función de notificación
const showError = (message: string, duration = 5000) => {
  // Usar librería de notificaciones (ej: react-toastify, sonner, etc.)
  toast.error(message, { duration });
};
```

### 4. Manejo de Errores de Red

Además de errores HTTP, manejar:
- **Timeout**: Mostrar mensaje "La solicitud está tardando demasiado. Por favor intenta nuevamente."
- **Sin conexión**: Mostrar mensaje "No hay conexión a internet. Verifica tu conexión."
- **CORS**: Generalmente no debería ocurrir, pero si sucede, contactar al equipo de backend.

### 5. Validación en el Frontend

Validar datos antes de enviarlos al backend para mejorar UX:
- Validar formato de email
- Validar longitud de contraseña
- Validar rangos numéricos
- Validar campos requeridos

### 6. Estados de Carga y Error

Manejar estados de UI:
- **Loading**: Mostrar spinner o skeleton mientras se procesa la solicitud
- **Error**: Mostrar mensaje de error y opción de reintentar
- **Success**: Mostrar mensaje de éxito cuando corresponda

## Ejemplo de Implementación

```typescript
// utils/errorHandler.ts
export const handleApiError = (error: any) => {
  const status = error.response?.status;
  const message = error.response?.data?.error?.message || 'Error desconocido';
  
  switch (status) {
    case 400:
      return { type: 'validation', message };
    case 401:
      // Limpiar sesión y redirigir
      clearSession();
      window.location.href = '/login';
      return { type: 'auth', message: 'Sesión expirada' };
    case 403:
      return { type: 'permission', message };
    case 404:
      return { type: 'notFound', message };
    case 409:
      return { type: 'conflict', message };
    case 500:
      return { type: 'server', message: 'Error del servidor. Intenta nuevamente.' };
    default:
      return { type: 'unknown', message };
  }
};
```

## Notas Importantes

1. **Seguridad**: Nunca revelar detalles técnicos de errores 500 al usuario final
2. **UX**: Los mensajes deben ser claros y accionables
3. **Consistencia**: Usar el mismo formato de mensajes en toda la aplicación
4. **Logging**: Registrar errores para debugging, pero no mostrar logs al usuario
5. **Retry**: Para errores 500, considerar implementar retry automático con backoff exponencial
6. **Offline**: Manejar casos donde no hay conexión a internet



