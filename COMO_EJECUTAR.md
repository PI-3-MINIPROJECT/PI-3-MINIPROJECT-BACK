# 🚀 Cómo Ejecutar el Backend

Guía rápida para poner en marcha el servidor backend.

## ⚡ Inicio Rápido (3 pasos)

### 1️⃣ Instalar Dependencias

Abre una terminal en la carpeta `Back` y ejecuta:

```bash
npm install
```

Esto instalará todas las librerías necesarias (Express, Socket.io, Firebase, etc.)

### 2️⃣ Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```bash
# En Windows (PowerShell)
copy env.example .env

# En Windows (CMD)
copy env.example .env

# En Linux/Mac
cp env.example .env
```

Luego edita el archivo `.env` y agrega tus credenciales de Firebase:
- Si no tienes Firebase configurado, lee: `GUIA_FIREBASE.md`
- Si no entiendes Firebase, lee primero: `FIREBASE_EXPLICACION_SIMPLE.md`

**Mínimo necesario para probar:**
```env
PORT=3000
NODE_ENV=development
FIREBASE_PROJECT_ID=tu-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@tu-proyecto.iam.gserviceaccount.com
CORS_ORIGIN=http://localhost:5173
```

### 3️⃣ Ejecutar el Servidor

#### Modo Desarrollo (recomendado):
```bash
npm run dev
```

Este comando:
- ✅ Ejecuta el servidor en modo desarrollo
- ✅ Recarga automáticamente cuando cambias código
- ✅ Muestra errores detallados

#### Modo Producción:
```bash
npm run build
npm start
```

## ✅ Verificar que Funciona

Si todo está bien, verás algo como esto:

```
✅ Firebase initialized successfully
✅ Socket.IO initialized successfully
🚀 Server running on port 3000
📡 Environment: development
🔗 Health check: http://localhost:3000/health
```

### Probar el servidor:

Abre tu navegador o usa curl:

```bash
# En el navegador
http://localhost:3000/health

# O con curl (si lo tienes instalado)
curl http://localhost:3000/health
```

Deberías ver:
```json
{
  "status": "ok",
  "timestamp": "2025-01-XX...",
  "environment": "development"
}
```

## 🐛 Problemas Comunes

### Error: "Missing Firebase configuration"
**Solución:** 
- Verifica que el archivo `.env` existe
- Verifica que tiene las 3 variables de Firebase configuradas
- Lee `GUIA_FIREBASE.md` para configurar Firebase

### Error: "Cannot find module"
**Solución:**
```bash
npm install
```

### Error: "Port 3000 is already in use"
**Solución:**
- Cambia el puerto en el archivo `.env`: `PORT=3001`
- O cierra la aplicación que está usando el puerto 3000

### Error: "ts-node-dev no se reconoce"
**Solución:**
```bash
npm install
```

## 📝 Comandos Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Ejecuta en modo desarrollo (con hot-reload) |
| `npm run build` | Compila TypeScript a JavaScript |
| `npm start` | Ejecuta en modo producción |
| `npm run lint` | Verifica errores de código |
| `npm run format` | Formatea el código automáticamente |

## 🔗 Endpoints Disponibles

Una vez que el servidor esté corriendo:

- **Health Check:** `GET http://localhost:3000/health`
- **API Base:** `http://localhost:3000/api`
- **Autenticación:** `http://localhost:3000/api/auth`
- **Usuarios:** `http://localhost:3000/api/users`
- **Reuniones:** `http://localhost:3000/api/meetings`

## 🎯 Próximos Pasos

1. ✅ Servidor corriendo
2. 🔗 Conectar el frontend (si ya lo tienes)
3. 🧪 Probar los endpoints con Postman o similar
4. 📡 Probar Socket.IO (conexión en tiempo real)

## 💡 Tips

- **Mantén la terminal abierta** mientras desarrollas
- **Usa `npm run dev`** para desarrollo (se recarga solo)
- **Revisa los logs** en la terminal para ver qué está pasando
- **El servidor se detiene** con `Ctrl + C` en la terminal



