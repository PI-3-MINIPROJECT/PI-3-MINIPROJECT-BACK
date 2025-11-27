# Arquitectura API Gateway

Este documento explica la arquitectura final donde **PI-3-MINIPROJECT-BACK** actúa como API Gateway.

## 🏗️ Arquitectura Final

```
┌─────────────────────────────────────────────────────────────────┐
│                     FRONTEND (React)                            │
│                  http://localhost:5173                          │
│                                                                 │
│  - Solo se conecta al User Backend (Port 3000)                 │
│  - Para HTTP usa: http://localhost:3000                        │
│  - Para WebSocket usa: ws://localhost:3000 (Socket.io)         │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ HTTP + WebSocket
                             │ (Cookie de sesión)
                             │
┌────────────────────────────▼──────────────────────────────┐
│         PI-3-MINIPROJECT-BACK (Port 3000)                 │
│                  API GATEWAY                              │
│                                                           │
│  📍 Responsabilidades:                                    │
│  ├─ Autenticación (login, registro, logout)              │
│  ├─ Gestión de usuarios (CRUD)                           │
│  ├─ Validación de sesiones (cookies)                     │
│  └─ Proxy a Chat Backend (reuniones y chat)              │
│                                                           │
│  🔀 Proxy Endpoints:                                      │
│  ├─ POST   /api/meetings → Chat Backend                  │
│  ├─ GET    /api/meetings → Chat Backend                  │
│  ├─ GET    /api/meetings/:id → Chat Backend              │
│  ├─ PUT    /api/meetings/:id → Chat Backend              │
│  ├─ DELETE /api/meetings/:id → Chat Backend              │
│  ├─ POST   /api/meetings/:id/join → Chat Backend         │
│  └─ POST   /api/meetings/:id/leave → Chat Backend        │
│                                                           │
│  🔌 WebSocket Proxy:                                      │
│  └─ Socket.io events → redirigidos a Chat Backend        │
└────────────────────────────┬──────────────────────────────┘
                             │
                             │ HTTP (Internal)
                             │
┌────────────────────────────▼──────────────────────────────┐
│      PI-3-MINIPROJECT-BACK-CHAT (Port 4000)               │
│             CHAT MICROSERVICE                             │
│                                                           │
│  📍 Responsabilidades:                                    │
│  ├─ CRUD de reuniones (CREATE, READ, UPDATE, DELETE)     │
│  ├─ Chat en tiempo real (Socket.io)                      │
│  ├─ Gestión de participantes (en memoria y BD)           │
│  └─ Almacenar info de reuniones en Firestore             │
│                                                           │
│  🗄️  Base de Datos (Firestore):                          │
│  └─ meetings/                                             │
│      └─ {meetingId}/                                      │
│          ├─ meetingId                                     │
│          ├─ hostId                                        │
│          ├─ title                                         │
│          ├─ description                                   │
│          ├─ participants[]  (histórico)                   │
│          ├─ activeParticipants (tiempo real)             │
│          ├─ createdAt                                     │
│          ├─ updatedAt                                     │
│          └─ status                                        │
│                                                           │
│  💬 Mensajes:                                             │
│  └─ Solo en tiempo real (NO se guardan en BD)            │
└───────────────────────────────────────────────────────────┘
```

## 🔄 Flujos Completos

### 1. Usuario Se Autentica

```
Frontend
  │
  └─► POST /api/auth/login
      └─► User Backend (3000)
           ├─ Valida credenciales en Firebase Auth
           ├─ Crea sesión
           └─ Retorna cookie: session=xxxxx
```

### 2. Usuario Crea Reunión

```
Frontend (con cookie)
  │
  └─► POST /api/meetings
      Body: { title: "Team Meeting", description: "..." }
      │
      └─► User Backend (3000) - API Gateway
           ├─ authMiddleware: Valida cookie
           ├─ Extrae userId de req.user
           │
           └─► HTTP Request a Chat Backend (4000)
               POST http://localhost:4000/api/meetings
               Body: { userId, title, description }
               │
               └─► Chat Backend
                    ├─ Genera meetingId único
                    ├─ Guarda en Firestore:
                    │   meetings/{meetingId}/
                    │     - meetingId: "abc123"
                    │     - hostId: userId
                    │     - title: "Team Meeting"
                    │     - participants: [userId]
                    │     - activeParticipants: 0
                    │     - status: "active"
                    │
                    └─► Retorna meetingData
                         │
Frontend ← User Backend ← Chat Backend
```

### 3. Usuario Lista Sus Reuniones

```
Frontend (con cookie)
  │
  └─► GET /api/meetings
      │
      └─► User Backend (3000) - API Gateway
           ├─ authMiddleware: Valida cookie
           ├─ Extrae userId de req.user
           │
           └─► HTTP Request a Chat Backend (4000)
               GET http://localhost:4000/api/meetings/user/{userId}
               │
               └─► Chat Backend
                    ├─ Query Firestore:
                    │   WHERE participants CONTAINS userId
                    │
                    └─► Retorna lista de reuniones
                         │
Frontend ← User Backend ← Chat Backend
```

### 4. Usuario Se Une al Chat (WebSocket)

**Opción A: Socket.io directo al Chat Backend**
```
Frontend (con cookie)
  │
  └─► Conecta WebSocket directamente
      ws://localhost:4000
      │
      └─► Chat Backend (4000)
           ├─ Lee cookie del handshake
           ├─ [Opcional] Valida con User Backend
           │
           └─► emit('join:meeting', { meetingId, userId })
                ├─ Agrega a lista en memoria
                ├─ Agrega a participants[] en Firestore
                ├─ Actualiza activeParticipants
                └─ Notifica: users:online
```

**Opción B: Socket.io via User Backend (Proxy)**
```
Frontend (con cookie)
  │
  └─► Conecta WebSocket a User Backend
      ws://localhost:3000
      │
      └─► User Backend (3000)
           ├─ Valida sesión
           │
           └─► Proxy a Chat Backend (4000)
                └─► Mismo flujo que Opción A
```

### 5. Usuario Envía Mensaje

```
Frontend
  │
  └─► emit('chat:message', { meetingId, userId, message })
      │
      └─► Chat Backend (4000)
           ├─ Valida datos
           ├─ ❌ NO guarda en Firestore
           └─► Broadcast a room
                io.to(meetingId).emit('chat:message', {...})
                │
Todos los conectados ← mensaje en tiempo real
```

## 📡 Endpoints del User Backend

### Autenticación (Directo)
```
POST   /api/auth/login         - Login
POST   /api/auth/register      - Registro
POST   /api/auth/logout        - Logout
GET    /api/auth/me            - Usuario actual
POST   /api/auth/forgot-password - Recuperar contraseña
```

### Usuarios (Directo)
```
GET    /api/users              - Listar usuarios
GET    /api/users/:userId      - Obtener usuario
PUT    /api/users/:userId      - Actualizar usuario
DELETE /api/users/:userId      - Eliminar usuario
```

### Reuniones (Proxy → Chat Backend)
```
POST   /api/meetings           - Crear reunión
GET    /api/meetings           - Listar reuniones del usuario
GET    /api/meetings/:id       - Obtener reunión
PUT    /api/meetings/:id       - Actualizar reunión
DELETE /api/meetings/:id       - Eliminar reunión
POST   /api/meetings/:id/join  - Unirse a reunión
POST   /api/meetings/:id/leave - Salir de reunión
```

## 🔐 Seguridad

### 1. Autenticación en User Backend
```typescript
// authMiddleware valida la cookie de sesión
if (!req.user) {
  return res.status(401).json({ error: 'Not authenticated' });
}
```

### 2. Proxy con userId
```typescript
// User Backend agrega el userId del usuario autenticado
const data = await fetch('http://localhost:4000/api/meetings', {
  method: 'POST',
  body: JSON.stringify({
    userId: req.user.uid, // Del middleware de auth
    title: req.body.title,
    description: req.body.description
  })
});
```

### 3. Chat Backend Confía en User Backend
```typescript
// Chat Backend NO valida autenticación
// Confía en que User Backend ya lo hizo
// Solo valida los datos del payload
```

## 🌐 Configuración

### Variables de Entorno

**User Backend (.env):**
```env
PORT=3000
NODE_ENV=development

# Firebase
FIREBASE_PROJECT_ID=tu-proyecto
FIREBASE_PRIVATE_KEY=tu-clave
FIREBASE_CLIENT_EMAIL=tu-email

# CORS
CORS_ORIGIN=http://localhost:5173

# Chat Backend URL
CHAT_BACKEND_URL=http://localhost:4000
```

**Chat Backend (.env):**
```env
PORT=4000
NODE_ENV=development

# Firebase (mismo proyecto)
FIREBASE_PROJECT_ID=tu-proyecto
FIREBASE_PRIVATE_KEY=tu-clave
FIREBASE_CLIENT_EMAIL=tu-email

# CORS (permite User Backend)
CORS_ORIGIN=http://localhost:5173,http://localhost:3000

# Meeting Config
MAX_PARTICIPANTS=10
MIN_PARTICIPANTS=2
```

**Frontend (.env):**
```env
# Solo necesita conocer el User Backend
VITE_API_URL=http://localhost:3000
```

## 💡 Ventajas de Esta Arquitectura

### 1. **Frontend Simplificado**
- Solo se conecta a UN servidor (User Backend)
- No necesita saber que existe un Chat Backend
- Configuración más simple

### 2. **Seguridad Centralizada**
- Toda autenticación pasa por User Backend
- Chat Backend es interno (no expuesto al frontend)
- Un solo punto de control de acceso

### 3. **Escalabilidad**
- Chat Backend puede escalar horizontalmente
- User Backend maneja el balanceo de carga
- Fácil agregar más instancias de Chat Backend

### 4. **Mantenimiento**
- Cambios en Chat Backend no afectan al frontend
- URL del Chat Backend puede cambiar sin impacto
- Lógica de negocio separada por dominio

## 🚀 Deployment en Producción

### Render URLs

**User Backend (API Gateway):**
```
https://pi3-user-backend.onrender.com
```

**Chat Backend (Internal):**
```
https://pi3-chat-backend.onrender.com
```

**Frontend:**
```
https://pi3-frontend.vercel.app
```

### Variables de Entorno Producción

**User Backend:**
```env
CORS_ORIGIN=https://pi3-frontend.vercel.app
CHAT_BACKEND_URL=https://pi3-chat-backend.onrender.com
```

**Chat Backend:**
```env
CORS_ORIGIN=https://pi3-frontend.vercel.app,https://pi3-user-backend.onrender.com
```

**Frontend:**
```env
VITE_API_URL=https://pi3-user-backend.onrender.com
```

## 🧪 Testing

### Test 1: Crear Reunión via API Gateway

```bash
# 1. Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"123456"}' \
  -c cookies.txt

# 2. Crear reunión (automáticamente hace proxy)
curl -X POST http://localhost:3000/api/meetings \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"title":"Test Meeting","description":"Test"}'
```

### Test 2: Frontend Completo

```javascript
// Frontend solo conoce User Backend
const API_URL = 'http://localhost:3000';

// 1. Login
await fetch(`${API_URL}/api/auth/login`, {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'user@test.com', password: '123456' })
});

// 2. Crear reunión (proxy automático a Chat Backend)
const response = await fetch(`${API_URL}/api/meetings`, {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ title: 'Team Meeting' })
});

const { data: meeting } = await response.json();

// 3. Conectar al chat (directo a Chat Backend o via proxy)
const socket = io('http://localhost:4000', {
  withCredentials: true
});

socket.emit('join:meeting', {
  meetingId: meeting.meetingId,
  userId: 'user123',
  username: 'Test User'
});
```

---

**¡Arquitectura API Gateway completa!** 🎯

El frontend solo se conecta al User Backend, que actúa como puerta de entrada única.

