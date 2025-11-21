# Documentación de API para Frontend

## 📋 Información General

### URL Base
```
Desarrollo: http://localhost:3000
Producción: [URL del servidor de producción]
```

### Configuración de CORS
El backend está configurado para aceptar requests desde:
- `http://localhost:5173` (Vite default)
- Configurar variable de entorno `CORS_ORIGIN` para otros puertos

### Autenticación
El sistema utiliza **cookies de sesión HTTP-only** para autenticación:
- Cookie name: `session`
- Duración: 5 días por defecto
- Secure: Solo HTTPS en producción
- SameSite: `lax`
- HttpOnly: `true` (no accesible desde JavaScript)

---

## 🔐 Autenticación (Auth)

### 1. Registro de Usuario
**Endpoint:** `POST /api/auth/register`

**Body:**
```json
{
  "email": "usuario@example.com",
  "password": "contraseña123",
  "name": "Juan",
  "last_name": "Pérez",
  "age": 25
}
```

**Validaciones:**
- `email`: Debe ser un email válido
- `password`: Mínimo 6 caracteres
- `name`: Entre 2 y 50 caracteres, no vacío
- `last_name`: Entre 2 y 50 caracteres, no vacío
- `age`: Número entero entre 1 y 120

**Respuesta Exitosa (201):**
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "data": {
    "uid": "firebase_user_id",
    "email": "usuario@example.com",
    "name": "Juan",
    "last_name": "Pérez",
    "age": 25
  }
}
```

**Errores Comunes:**
- 409: Email ya registrado
- 400: Datos inválidos

### 2. Inicio de Sesión
**Endpoint:** `POST /api/auth/login`

**Body:**
```json
{
  "email": "usuario@example.com",
  "password": "contraseña123"
}
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "message": "Inicio de sesión exitoso",
  "data": {
    "uid": "firebase_user_id",
    "email": "usuario@example.com",
    "name": "Juan",
    "last_name": "Pérez",
    "age": 25
  }
}
```

**Nota:** Establece automáticamente la cookie de sesión.

**Errores Comunes:**
- 401: Credenciales incorrectas
- 400: Email o password faltantes

### 3. Cerrar Sesión
**Endpoint:** `POST /api/auth/logout`
**Autenticación:** Requerida

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "message": "Cierre de sesión exitoso"
}
```

**Nota:** Limpia automáticamente la cookie de sesión y revoca tokens.

### 4. Actualizar Contraseña
**Endpoint:** `PUT /api/auth/update-password`
**Autenticación:** Requerida

**Body:**
```json
{
  "currentPassword": "contraseñaActual123",
  "newPassword": "nuevaContraseña123",
  "confirmPassword": "nuevaContraseña123"
}
```

**Validaciones:**
- `currentPassword`: Requerida, debe coincidir con la contraseña actual del usuario
- `newPassword`: Mínimo 6 caracteres
- `confirmPassword`: Debe coincidir exactamente con `newPassword`

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "message": "Contraseña actualizada exitosamente"
}
```

**Errores Comunes:**
- 400: Contraseña actual incorrecta
- 400: Las contraseñas no coinciden
- 400: Nueva contraseña muy débil
- 401: Usuario no autenticado

### 5. Recuperar Contraseña
**Endpoint:** `POST /api/auth/reset-password`

**Body:**
```json
{
  "email": "usuario@example.com"
}
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "message": "Se ha enviado un enlace de recuperación a tu correo electrónico",
  "data": {
    "email": "usuario@example.com"
  }
}
```

**Errores Comunes:**
- 400: No existe una cuenta con este correo electrónico
- 500: Error del servidor

### 6. Confirmar Recuperación de Contraseña
**Endpoint:** `POST /api/auth/confirm-password-reset`

**Body:**
```json
{
  "oobCode": "codigo_del_email",
  "newPassword": "nuevaContrasena123"
}
```

**Validaciones:**
- `oobCode`: Código obtenido del enlace del email (parámetro `oobCode` de la URL)
- `newPassword`: Mínimo 6 caracteres

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "message": "Contraseña restablecida exitosamente",
  "data": {
    "email": "usuario@example.com"
  }
}
```

**Errores Comunes:**
- 400: El código de recuperación es inválido
- 400: El enlace de recuperación ha expirado
- 400: La contraseña debe tener al menos 6 caracteres

### 7. OAuth con Google
**Endpoint:** `GET /api/auth/oauth/google`

**Flujo:**
1. Redirige al usuario a Google para autenticación
2. Google redirige de vuelta con código
3. Backend procesa el código y establece cookie de sesión
4. Redirige al frontend

**Para usar desde frontend:**
```javascript
// Redirigir usuario al endpoint de OAuth
window.location.href = '/api/auth/oauth/google';
```

---

## 👤 Gestión de Usuarios

### 1. Obtener Perfil Actual
**Endpoint:** `GET /api/users/profile`
**Autenticación:** Requerida

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "data": {
    "uid": "firebase_user_id",
    "email": "usuario@example.com",
    "name": "Juan",
    "last_name": "Pérez",
    "age": 25,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### 2. Actualizar Perfil
**Endpoint:** `PUT /api/users/profile`
**Autenticación:** Requerida

**Body (todos opcionales):**
```json
{
  "name": "Juan Carlos",
  "last_name": "Pérez García",
  "age": 26,
  "email": "nuevo@example.com"
}
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "message": "Perfil actualizado exitosamente",
  "data": {
    "uid": "firebase_user_id",
    "email": "nuevo@example.com",
    "name": "Juan Carlos",
    "last_name": "Pérez García",
    "age": 26,
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### 3. Eliminar Cuenta
**Endpoint:** `DELETE /api/users/profile`
**Autenticación:** Requerida

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "message": "Cuenta eliminada exitosamente"
}
```

### 4. Obtener Usuario por ID
**Endpoint:** `GET /api/users/:userId`
**Autenticación:** Requerida

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "data": {
    "uid": "firebase_user_id",
    "email": "usuario@example.com",
    "name": "Juan",
    "last_name": "Pérez",
    "age": 25,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

---

## 🎥 Gestión de Reuniones

### 1. Crear Reunión
**Endpoint:** `POST /api/meetings`
**Autenticación:** Requerida

**Body (todos opcionales):**
```json
{
  "title": "Reunión de trabajo",
  "description": "Discusión sobre el proyecto"
}
```

**Respuesta Exitosa (201):**
```json
{
  "success": true,
  "message": "Reunión creada exitosamente",
  "data": {
    "meetingId": "meeting_unique_id",
    "hostId": "firebase_user_id",
    "title": "Reunión de trabajo",
    "description": "Discusión sobre el proyecto",
    "participants": ["firebase_user_id"],
    "status": "active",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### 2. Obtener Reuniones del Usuario
**Endpoint:** `GET /api/meetings`
**Autenticación:** Requerida

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "data": [
    {
      "meetingId": "meeting_unique_id",
      "hostId": "firebase_user_id",
      "title": "Reunión de trabajo",
      "description": "Discusión sobre el proyecto",
      "participants": ["firebase_user_id", "other_user_id"],
      "status": "active",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  ]
}
```

### 3. Obtener Reunión por ID
**Endpoint:** `GET /api/meetings/:meetingId`
**Autenticación:** Requerida

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "data": {
    "meetingId": "meeting_unique_id",
    "hostId": "firebase_user_id",
    "title": "Reunión de trabajo",
    "description": "Discusión sobre el proyecto",
    "participants": ["firebase_user_id", "other_user_id"],
    "status": "active",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### 4. Unirse a Reunión
**Endpoint:** `POST /api/meetings/:meetingId/join`
**Autenticación:** Requerida

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "message": "Se unió a la reunión exitosamente"
}
```

### 5. Salir de Reunión
**Endpoint:** `POST /api/meetings/:meetingId/leave`
**Autenticación:** Requerida

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "message": "Salió de la reunión exitosamente"
}
```

### 6. Eliminar Reunión
**Endpoint:** `DELETE /api/meetings/:meetingId`
**Autenticación:** Requerida

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "message": "Reunión eliminada exitosamente"
}
```

---

## 🔌 WebSocket / Socket.IO

### Configuración del Cliente
```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', {
  withCredentials: true, // Importante para enviar cookies
  transports: ['websocket', 'polling']
});
```

### Eventos que el Cliente puede Emitir

#### 1. Unirse a Reunión
```javascript
socket.emit('join-meeting', {
  meetingId: 'meeting_unique_id',
  userId: 'firebase_user_id'
});
```

#### 2. Salir de Reunión
```javascript
socket.emit('leave-meeting', {
  meetingId: 'meeting_unique_id',
  userId: 'firebase_user_id'
});
```

#### 3. Enviar Mensaje de Chat
```javascript
socket.emit('chat-message', {
  meetingId: 'meeting_unique_id',
  message: 'Hola a todos',
  userId: 'firebase_user_id',
  userName: 'Juan Pérez'
});
```

#### 4. WebRTC - Enviar Oferta
```javascript
socket.emit('webrtc-offer', {
  meetingId: 'meeting_unique_id',
  offer: rtcPeerConnection.localDescription,
  targetUserId: 'target_user_id'
});
```

#### 5. WebRTC - Enviar Respuesta
```javascript
socket.emit('webrtc-answer', {
  meetingId: 'meeting_unique_id',
  answer: rtcPeerConnection.localDescription,
  targetUserId: 'target_user_id'
});
```

#### 6. WebRTC - Enviar ICE Candidate
```javascript
socket.emit('webrtc-ice-candidate', {
  meetingId: 'meeting_unique_id',
  candidate: event.candidate,
  targetUserId: 'target_user_id'
});
```

#### 7. Alternar Micrófono
```javascript
socket.emit('toggle-microphone', {
  meetingId: 'meeting_unique_id',
  userId: 'firebase_user_id',
  isMuted: true
});
```

#### 8. Alternar Cámara
```javascript
socket.emit('toggle-camera', {
  meetingId: 'meeting_unique_id',
  userId: 'firebase_user_id',
  isVideoOff: true
});
```

### Eventos que el Cliente debe Escuchar

#### 1. Usuario se Unió
```javascript
socket.on('user-joined', (data) => {
  console.log(`Usuario ${data.userId} se unió`, data.socketId);
  // Agregar usuario a la interfaz
});
```

#### 2. Usuario se Fue
```javascript
socket.on('user-left', (data) => {
  console.log(`Usuario ${data.userId} se fue`, data.socketId);
  // Remover usuario de la interfaz
});
```

#### 3. Mensaje de Chat Recibido
```javascript
socket.on('chat-message', (data) => {
  console.log('Nuevo mensaje:', data);
  // data: { message, userId, userName, timestamp }
});
```

#### 4. WebRTC - Oferta Recibida
```javascript
socket.on('webrtc-offer', async (data) => {
  // data: { offer, fromUserId, targetUserId }
  await rtcPeerConnection.setRemoteDescription(data.offer);
  const answer = await rtcPeerConnection.createAnswer();
  await rtcPeerConnection.setLocalDescription(answer);
  
  socket.emit('webrtc-answer', {
    meetingId: 'meeting_unique_id',
    answer: answer,
    targetUserId: data.fromUserId
  });
});
```

#### 5. WebRTC - Respuesta Recibida
```javascript
socket.on('webrtc-answer', async (data) => {
  // data: { answer, fromUserId, targetUserId }
  await rtcPeerConnection.setRemoteDescription(data.answer);
});
```

#### 6. WebRTC - ICE Candidate Recibido
```javascript
socket.on('webrtc-ice-candidate', async (data) => {
  // data: { candidate, fromUserId, targetUserId }
  await rtcPeerConnection.addIceCandidate(data.candidate);
});
```

#### 7. Micrófono Alternado
```javascript
socket.on('microphone-toggled', (data) => {
  // data: { userId, isMuted }
  // Actualizar UI para mostrar estado del micrófono del usuario
});
```

#### 8. Cámara Alternada
```javascript
socket.on('camera-toggled', (data) => {
  // data: { userId, isVideoOff }
  // Actualizar UI para mostrar estado de la cámara del usuario
});
```

---

## 🏥 Health Check

### Verificar Estado del Servidor
**Endpoint:** `GET /health`

**Respuesta Exitosa (200):**
```json
{
  "status": "ok",
  "timestamp": "2023-01-01T00:00:00.000Z",
  "environment": "development"
}
```

---

## 🚨 Manejo de Errores

### Estructura de Error Estándar
```json
{
  "success": false,
  "message": "Descripción del error",
  "error": "Detalles técnicos (solo en desarrollo)"
}
```

### Códigos de Estado HTTP Comunes
- `200`: Éxito
- `201`: Creado exitosamente
- `400`: Solicitud incorrecta (datos inválidos)
- `401`: No autenticado
- `403`: No autorizado (sin permisos)
- `404`: Recurso no encontrado
- `409`: Conflicto (ej: email ya existe)
- `500`: Error interno del servidor

---

## 💡 Ejemplos de Uso en Frontend

### Configuración con Axios
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  withCredentials: true, // Importante para cookies
});

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirigir a login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### Ejemplo de Login Completo
```javascript
const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', {
      email,
      password
    });
    
    // La cookie se establece automáticamente
    return response.data.data; // Datos del usuario
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error de login');
  }
};
```

### Ejemplo de Actualización de Contraseña
```javascript
const updatePassword = async (currentPassword, newPassword, confirmPassword) => {
  try {
    const response = await api.put('/auth/update-password', {
      currentPassword,
      newPassword,
      confirmPassword
    });
    
    return response.data; // { success: true, message: "..." }
  } catch (error) {
    // Manejar errores específicos
    const errorMessage = error.response?.data?.message || 'Error al actualizar contraseña';
    throw new Error(errorMessage);
  }
};

// Ejemplo de uso en un componente
const handlePasswordUpdate = async (formData) => {
  try {
    await updatePassword(
      formData.currentPassword,
      formData.newPassword,
      formData.confirmPassword
    );
    
    // Mostrar mensaje de éxito
    alert('Contraseña actualizada exitosamente');
  } catch (error) {
    // Mostrar error al usuario
    alert(error.message);
  }
};
```

### Ejemplo de Recuperación de Contraseña
```javascript
// Paso 1: Solicitar recuperación
const requestPasswordReset = async (email) => {
  try {
    const response = await api.post('/auth/reset-password', { email });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Error al enviar email';
    throw new Error(errorMessage);
  }
};

// Paso 2: Confirmar nueva contraseña (desde la página del enlace)
const confirmPasswordReset = async (oobCode, newPassword) => {
  try {
    const response = await api.post('/auth/confirm-password-reset', {
      oobCode,
      newPassword
    });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Error al restablecer contraseña';
    throw new Error(errorMessage);
  }
};

// Ejemplo de uso completo
const handleForgotPassword = async (email) => {
  try {
    await requestPasswordReset(email);
    alert('Se ha enviado un enlace de recuperación a tu correo');
  } catch (error) {
    alert(error.message);
  }
};

// En la página de reset (obteniendo oobCode de la URL)
const handlePasswordReset = async (newPassword) => {
  const urlParams = new URLSearchParams(window.location.search);
  const oobCode = urlParams.get('oobCode');
  
  if (!oobCode) {
    alert('Enlace de recuperación inválido');
    return;
  }
  
  try {
    await confirmPasswordReset(oobCode, newPassword);
    alert('Contraseña restablecida exitosamente');
    // Redirigir al login
    window.location.href = '/login';
  } catch (error) {
    alert(error.message);
  }
};
```

### Ejemplo de Manejo de WebSocket
```javascript
class MeetingService {
  constructor() {
    this.socket = io('http://localhost:3000', {
      withCredentials: true
    });
    
    this.setupEventListeners();
  }
  
  setupEventListeners() {
    this.socket.on('user-joined', this.handleUserJoined);
    this.socket.on('user-left', this.handleUserLeft);
    this.socket.on('chat-message', this.handleChatMessage);
    // ... otros eventos
  }
  
  joinMeeting(meetingId, userId) {
    this.socket.emit('join-meeting', { meetingId, userId });
  }
  
  sendChatMessage(meetingId, message, userId, userName) {
    this.socket.emit('chat-message', {
      meetingId,
      message,
      userId,
      userName
    });
  }
}
```

---

## 🔧 Variables de Entorno Necesarias

Para conectar correctamente con el backend, asegúrate de que estas variables estén configuradas:

```env
# Backend
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:5173

# Firebase
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=1:123456789:web:abcdef

# OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
OAUTH_CALLBACK_URL=http://localhost:3000/api/auth/oauth/google

# Sesiones
SESSION_COOKIE_EXPIRES_IN_MS=432000000

# Frontend
FRONTEND_URL=http://localhost:5173
```

---

## 📝 Notas Importantes

1. **Cookies HTTP-only**: La autenticación se maneja automáticamente via cookies, no necesitas manejar tokens manualmente.

2. **CORS**: Asegúrate de que el frontend esté ejecutándose en la URL configurada en `CORS_ORIGIN`.

3. **WebSocket**: Los eventos de Socket.IO requieren que el usuario esté autenticado (cookie válida).

4. **Validaciones**: Todos los endpoints validan los datos de entrada. Revisa los mensajes de error para debugging.

5. **Firebase**: El backend usa Firebase para autenticación y Firestore para almacenamiento.

6. **OAuth**: El flujo de Google OAuth es server-side y redirige automáticamente al frontend.

7. **Errores**: Siempre verifica el campo `success` en las respuestas antes de procesar los datos.

---

Este documento debe cubrir toda la información necesaria para que el frontend se conecte correctamente con todos los endpoints y funcionalidades del backend.