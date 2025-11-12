# 🔥 Guía de Configuración de Firebase

Esta guía te ayudará a configurar Firebase para el backend de la plataforma de videoconferencias.

## ¿Qué es Firebase?

Firebase es una plataforma de Google que proporciona:
- **Firebase Authentication**: Para autenticar usuarios (login, registro, OAuth)
- **Firestore**: Base de datos NoSQL para almacenar información
- **Firebase Admin SDK**: Para que el backend pueda gestionar usuarios y datos

## 📋 Paso 1: Crear un Proyecto en Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Haz clic en **"Agregar proyecto"** o **"Add project"**
3. Ingresa un nombre para tu proyecto (ej: `videoconference-platform`)
4. Sigue los pasos del asistente:
   - Desactiva Google Analytics (opcional, no es necesario para este proyecto)
   - Haz clic en **"Crear proyecto"**

## 🔐 Paso 2: Habilitar Firebase Authentication

1. En el menú lateral, ve a **"Authentication"** (Autenticación)
2. Haz clic en **"Comenzar"** o **"Get started"**
3. Ve a la pestaña **"Sign-in method"** (Métodos de inicio de sesión)
4. Habilita los siguientes proveedores:
   - **Email/Password**: Actívalo
   - **Google**: Actívalo (para OAuth)
   - **GitHub**: Actívalo (para OAuth) - Si no aparece, necesitarás configurarlo manualmente

## 🗄️ Paso 3: Habilitar Firestore Database

1. En el menú lateral, ve a **"Firestore Database"**
2. Haz clic en **"Crear base de datos"** o **"Create database"**
3. Selecciona **"Iniciar en modo de prueba"** (Start in test mode)
   - ⚠️ **Importante**: En producción deberás configurar reglas de seguridad
4. Elige una ubicación para tu base de datos (puedes dejar la predeterminada)
5. Haz clic en **"Habilitar"**

## 🔑 Paso 4: Obtener las Credenciales del Admin SDK

1. En el menú lateral, haz clic en el ícono de **configuración (⚙️)** junto a "Project Overview"
2. Selecciona **"Configuración del proyecto"** o **"Project settings"**
3. Ve a la pestaña **"Cuentas de servicio"** o **"Service accounts"**
4. Haz clic en **"Generar nueva clave privada"** o **"Generate new private key"**
5. Se descargará un archivo JSON (ej: `videoconference-platform-xxxxx-firebase-adminsdk-xxxxx.json`)

## 📝 Paso 5: Configurar el archivo .env

1. Abre el archivo JSON que descargaste
2. Necesitarás estos valores del JSON:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `private_key` → `FIREBASE_PRIVATE_KEY` (toda la cadena, incluyendo `\n`)
   - `client_email` → `FIREBASE_CLIENT_EMAIL`

3. Crea un archivo `.env` en la raíz del proyecto (copia desde `env.example`):
```bash
cp env.example .env
```

4. Abre el archivo `.env` y reemplaza los valores:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Firebase Configuration
FIREBASE_PROJECT_ID=tu-project-id-aqui
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nTu-clave-privada-completa-aqui\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@tu-proyecto.iam.gserviceaccount.com

# Firebase Web SDK (opcional, para el frontend)
FIREBASE_API_KEY=tu-api-key
FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=1:123456789:web:abcdef

# JWT Secret (genera uno aleatorio)
JWT_SECRET=tu-clave-secreta-super-segura-aqui

# CORS
CORS_ORIGIN=http://localhost:5173

# STUN Servers (ya están configurados)
STUN_SERVER_1=stun:stun1.l.google.com:19302
STUN_SERVER_2=stun:stun2.l.google.com:19302
```

### ⚠️ Importante sobre FIREBASE_PRIVATE_KEY:

El `private_key` del JSON viene con `\n` como texto literal. Debes mantenerlo así en el `.env`, pero asegúrate de que esté entre comillas dobles:

```env
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
```

## 🔍 Paso 6: Obtener las Credenciales del Web SDK (para el frontend)

1. En Firebase Console, ve a **Configuración del proyecto** → **General**
2. Baja hasta **"Tus aplicaciones"** o **"Your apps"**
3. Si no tienes una app web, haz clic en el ícono **`</>`** (Web)
4. Registra la app con un nombre (ej: "Videoconference Platform")
5. Copia los valores de configuración:
   - `apiKey` → `FIREBASE_API_KEY`
   - `authDomain` → `FIREBASE_AUTH_DOMAIN`
   - `projectId` → Ya lo tienes
   - `storageBucket` → `FIREBASE_STORAGE_BUCKET`
   - `messagingSenderId` → `FIREBASE_MESSAGING_SENDER_ID`
   - `appId` → `FIREBASE_APP_ID`

## ✅ Paso 7: Verificar la Configuración

1. Asegúrate de que el archivo `.env` esté en la raíz del proyecto
2. Instala las dependencias:
```bash
npm install
```

3. Ejecuta el servidor:
```bash
npm run dev
```

4. Si ves este mensaje, todo está bien:
```
✅ Firebase initialized successfully
🚀 Server running on port 3000
```

## 🎯 Resumen de lo que necesitas del JSON de Firebase:

```json
{
  "type": "service_account",
  "project_id": "tu-proyecto-id",           ← FIREBASE_PROJECT_ID
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",  ← FIREBASE_PRIVATE_KEY
  "client_email": "firebase-adminsdk-xxxxx@tu-proyecto.iam.gserviceaccount.com",  ← FIREBASE_CLIENT_EMAIL
  ...
}
```

## 🆘 Problemas Comunes

### Error: "Missing Firebase configuration"
- Verifica que el archivo `.env` existe
- Verifica que todas las variables están definidas
- Asegúrate de que `FIREBASE_PRIVATE_KEY` está entre comillas dobles

### Error: "Invalid credentials"
- Verifica que copiaste correctamente el `private_key` con los `\n`
- Asegúrate de que el `client_email` es correcto

### Error: "Permission denied"
- Verifica que Firestore está habilitado
- Verifica que Authentication está habilitado

## 📚 Recursos Adicionales

- [Documentación de Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Documentación de Firestore](https://firebase.google.com/docs/firestore)
- [Documentación de Firebase Auth](https://firebase.google.com/docs/auth)

