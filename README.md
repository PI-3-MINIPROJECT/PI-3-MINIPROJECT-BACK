# Plataforma de Videoconferencias - Backend

Backend para la plataforma de videoconferencias desarrollado con Node.js, Express, TypeScript, Socket.io y Firebase.

## 🚀 Características

- **Autenticación**: Registro, login, logout, recuperación de contraseña y OAuth (Google, GitHub)
- **Gestión de Usuarios**: Perfil, edición y eliminación de cuenta
- **Reuniones**: Creación, unión, salida y eliminación de reuniones (2-10 participantes)
- **Chat en Tiempo Real**: Comunicación instantánea mediante Socket.io
- **WebRTC**: Preparado para transmisión de voz y video con Peer.js
- **Base de Datos**: Firestore para persistencia de datos

## 📋 Requisitos Previos

- Node.js >= 18.0.0
- npm >= 9.0.0
- Cuenta de Firebase con Firestore habilitado
- Credenciales de Firebase Admin SDK

## 🛠️ Instalación

1. Clona el repositorio:
```bash
git clone <repository-url>
cd Back
```

2. Instala las dependencias:
```bash
npm install
```

3. Configura las variables de entorno:
```bash
cp env.example .env
```

4. **⚠️ IMPORTANTE: Configura Firebase**
   - Si no entiendes Firebase, lee primero: **`FIREBASE_EXPLICACION_SIMPLE.md`**
   - Para pasos detallados, sigue: **`GUIA_FIREBASE.md`**
   - Básicamente necesitas:
     1. Crear un proyecto en [Firebase Console](https://console.firebase.google.com/)
     2. Habilitar Authentication y Firestore
     3. Descargar las credenciales (archivo JSON)
     4. Copiar los valores al archivo `.env`

5. Edita el archivo `.env` con tus credenciales de Firebase:
```env
PORT=3000
NODE_ENV=development
FIREBASE_PROJECT_ID=tu-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@tu-proyecto.iam.gserviceaccount.com
CORS_ORIGIN=http://localhost:5173
```

## 🏃 Ejecución

### Desarrollo
```bash
npm run dev
```

### Producción
```bash
npm run build
npm start
```

El servidor estará disponible en `http://localhost:3000`

## 📁 Estructura del Proyecto

```
Back/
├── src/
│   ├── config/
│   │   ├── firebase.ts      # Configuración de Firebase
│   │   └── socket.ts        # Configuración de Socket.IO
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── user.controller.ts
│   │   └── meeting.controller.ts
│   ├── middlewares/
│   │   ├── auth.middleware.ts
│   │   ├── errorHandler.ts
│   │   └── notFoundHandler.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── user.routes.ts
│   │   └── meeting.routes.ts
│   └── server.ts            # Punto de entrada de la aplicación
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## 🔌 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registrar nuevo usuario
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/logout` - Cerrar sesión
- `POST /api/auth/reset-password` - Solicitar recuperación de contraseña
- `POST /api/auth/oauth/google` - OAuth con Google
- `POST /api/auth/oauth/github` - OAuth con GitHub

### Usuarios
- `GET /api/users/profile` - Obtener perfil del usuario actual
- `PUT /api/users/profile` - Actualizar perfil
- `DELETE /api/users/profile` - Eliminar cuenta
- `GET /api/users/:userId` - Obtener usuario por ID

### Reuniones
- `POST /api/meetings` - Crear nueva reunión
- `GET /api/meetings` - Obtener todas las reuniones del usuario
- `GET /api/meetings/:meetingId` - Obtener reunión por ID
- `POST /api/meetings/:meetingId/join` - Unirse a una reunión
- `POST /api/meetings/:meetingId/leave` - Salir de una reunión
- `DELETE /api/meetings/:meetingId` - Eliminar reunión

### Health Check
- `GET /health` - Verificar estado del servidor

## 🔐 Autenticación

La mayoría de los endpoints requieren autenticación. Incluye el token de Firebase en el header:

```
Authorization: Bearer <firebase-id-token>
```

## 📡 Socket.IO Events

### Cliente → Servidor
- `join-meeting` - Unirse a una reunión
- `leave-meeting` - Salir de una reunión
- `chat-message` - Enviar mensaje de chat
- `webrtc-offer` - Oferta WebRTC
- `webrtc-answer` - Respuesta WebRTC
- `webrtc-ice-candidate` - Candidato ICE
- `toggle-microphone` - Activar/desactivar micrófono
- `toggle-camera` - Activar/desactivar cámara

### Servidor → Cliente
- `user-joined` - Usuario se unió a la reunión
- `user-left` - Usuario salió de la reunión
- `chat-message` - Mensaje de chat recibido
- `webrtc-offer` - Oferta WebRTC recibida
- `webrtc-answer` - Respuesta WebRTC recibida
- `webrtc-ice-candidate` - Candidato ICE recibido
- `microphone-toggled` - Estado del micrófono cambiado
- `camera-toggled` - Estado de la cámara cambiado

## 🗄️ Base de Datos (Firestore)

### Colecciones

#### users
```typescript
{
  uid: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}
```

#### meetings
```typescript
{
  meetingId: string;
  hostId: string;
  title: string;
  description: string;
  participants: string[];
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'ended';
}
```

#### chat (futuro)
```typescript
{
  meetingId: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: string;
}
```

#### summaries (futuro)
```typescript
{
  meetingId: string;
  summary: string;
  createdAt: string;
}
```

## 🚢 Despliegue en Render

1. Conecta tu repositorio de GitHub a Render
2. Crea un nuevo Web Service
3. Configura:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Environment**: Node
4. Agrega las variables de entorno desde el archivo `.env`
5. Render automáticamente detectará el puerto desde `process.env.PORT`

## 📝 Scripts Disponibles

- `npm run dev` - Ejecutar en modo desarrollo con hot-reload
- `npm run build` - Compilar TypeScript a JavaScript
- `npm start` - Ejecutar en modo producción
- `npm run lint` - Ejecutar linter
- `npm run format` - Formatear código con Prettier

## 🔧 Tecnologías Utilizadas

- **Node.js** - Runtime de JavaScript
- **Express** - Framework web
- **TypeScript** - Superset de JavaScript con tipado estático
- **Socket.io** - Comunicación en tiempo real
- **Firebase Admin SDK** - Autenticación y base de datos
- **Firestore** - Base de datos NoSQL
- **Helmet** - Seguridad HTTP
- **CORS** - Control de acceso de origen cruzado
- **Morgan** - Logger HTTP

## 📄 Licencia

ISC

## 👥 Equipo

Proyecto desarrollado para el curso 750018C PROYECTO INTEGRADOR I 2025-2

