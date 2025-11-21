# 🚀 Guía de Despliegue en Render

Esta guía te ayudará a desplegar tu backend de videoconferencias en Render.

## 📋 Pre-requisitos

1. Cuenta en [Render](https://render.com)
2. Proyecto de Firebase configurado
3. Repositorio en GitHub/GitLab/Bitbucket

## 🔧 Configuración en Render

### Paso 1: Crear un nuevo Web Service

1. Ve a tu [Dashboard de Render](https://dashboard.render.com/)
2. Click en **"New +"** → **"Web Service"**
3. Conecta tu repositorio de GitHub/GitLab
4. Selecciona este repositorio

### Paso 2: Configuración Básica

Render debería detectar automáticamente la configuración del archivo `render.yaml`, pero verifica:

- **Name**: `videoconference-platform-backend` (o el nombre que prefieras)
- **Environment**: `Node`
- **Region**: Elige la más cercana a tus usuarios
- **Branch**: `main` o `master`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

### Paso 3: Variables de Entorno

Debes configurar las siguientes variables de entorno en Render:

#### 🔥 Firebase Admin SDK (Backend)

Obtén estos valores desde la consola de Firebase:
- Ve a **Project Settings** → **Service Accounts**
- Click en **Generate New Private Key**

```
FIREBASE_PROJECT_ID=tu-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@tu-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nTU_CLAVE_PRIVADA_AQUI\n-----END PRIVATE KEY-----\n"
```

⚠️ **IMPORTANTE**: La `FIREBASE_PRIVATE_KEY` debe incluir las comillas y los `\n` para los saltos de línea.

#### 🌐 Firebase Web SDK (Para Autenticación)

Obtén estos valores desde:
- Ve a **Project Settings** → **General** → **Your apps**
- Selecciona tu app web o crea una nueva

```
FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
FIREBASE_AUTH_DOMAIN=tu-project-id.firebaseapp.com
FIREBASE_STORAGE_BUCKET=tu-project-id.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789012
FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

#### 🔐 Otras Variables

```
NODE_ENV=production
PORT=10000
CORS_ORIGIN=https://tu-frontend.com
JWT_SECRET=tu-secreto-super-seguro-cambialo-en-produccion
```

#### 🎥 STUN Servers (Opcional - ya están en render.yaml)

```
STUN_SERVER_1=stun:stun1.l.google.com:19302
STUN_SERVER_2=stun:stun2.l.google.com:19302
```

### Paso 4: Configurar CORS

En la variable `CORS_ORIGIN`, coloca la URL de tu frontend:

```
CORS_ORIGIN=https://tu-frontend.vercel.app
```

O si tienes múltiples orígenes (separados por coma):

```
CORS_ORIGIN=https://tu-frontend.vercel.app,https://www.tu-dominio.com
```

## 📝 Cómo Agregar Variables de Entorno en Render

### Opción 1: Durante la creación del servicio

1. En la sección **Environment Variables**
2. Click en **Add Environment Variable**
3. Ingresa el **Key** y **Value**
4. Repite para cada variable

### Opción 2: Después de crear el servicio

1. Ve a tu servicio en el Dashboard
2. Click en **Environment** en el menú lateral
3. Click en **Add Environment Variable**
4. Ingresa el **Key** y **Value**
5. Click en **Save Changes**

## 🔒 Seguridad de las Variables

### Para FIREBASE_PRIVATE_KEY

La clave privada debe estar en formato de una sola línea con `\n` para los saltos:

```bash
# Formato correcto:
"-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEF...\n-----END PRIVATE KEY-----\n"
```

Si tienes problemas, puedes usar este script en Node.js para formatearla:

```javascript
const key = `-----BEGIN PRIVATE KEY-----
TU_CLAVE_AQUI
-----END PRIVATE KEY-----`;

console.log(JSON.stringify(key));
// Copia el resultado (con las comillas)
```

## 🚀 Despliegue

Una vez configuradas todas las variables:

1. Click en **Create Web Service** (si es nuevo)
2. O click en **Manual Deploy** → **Deploy latest commit** (si ya existe)
3. Render comenzará a construir y desplegar tu aplicación

## 📊 Monitoreo

### Ver Logs

1. Ve a tu servicio en el Dashboard
2. Click en **Logs** en el menú lateral
3. Verás los logs en tiempo real

### Health Check

Render automáticamente verificará que tu servicio esté funcionando en:

```
https://tu-servicio.onrender.com/health
```

Deberías ver:

```json
{
  "status": "ok",
  "service": "users-gateway",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "environment": "production"
}
```

## 🔄 Actualizaciones Automáticas

Render detectará automáticamente los cambios en tu repositorio y desplegará:

- **Auto-Deploy**: Habilitado por defecto en la rama principal
- Cada `git push` disparará un nuevo despliegue

Para deshabilitarlo:
1. Ve a **Settings**
2. Desactiva **Auto-Deploy**

## 🌐 Dominio Personalizado

### Usar tu propio dominio

1. Ve a **Settings** → **Custom Domain**
2. Click en **Add Custom Domain**
3. Ingresa tu dominio: `api.tudominio.com`
4. Configura los registros DNS según las instrucciones de Render

### Registros DNS necesarios

```
Type: CNAME
Name: api (o el subdominio que quieras)
Value: tu-servicio.onrender.com
```

## 🔧 Configuración Avanzada

### Escalado

Render ofrece diferentes planes:

- **Free**: 512 MB RAM, duerme después de 15 min de inactividad
- **Starter**: $7/mes, 512 MB RAM, siempre activo
- **Standard**: $25/mes, 2 GB RAM
- **Pro**: $85/mes, 4 GB RAM

### Variables de Entorno Sensibles

Para mayor seguridad, usa **Environment Groups**:

1. Ve a **Account Settings** → **Environment Groups**
2. Crea un grupo con tus variables de Firebase
3. Vincula el grupo a tu servicio

## 🐛 Solución de Problemas

### Error: "Cannot find module"

```bash
# Asegúrate de que el Build Command incluya:
npm install && npm run build
```

### Error: "Port already in use"

Render asigna automáticamente el puerto. Asegúrate de usar:

```javascript
const PORT = process.env.PORT || 3000;
```

### Error: "FIREBASE_PRIVATE_KEY invalid"

Verifica que la clave tenga el formato correcto con `\n` y esté entre comillas.

### Session Cookies no funcionan

Verifica que `CORS_ORIGIN` apunte a tu frontend y que esté configurado con `credentials: true`.

## 📚 Recursos Adicionales

- [Documentación de Render](https://render.com/docs)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Node.js en Render](https://render.com/docs/deploy-node-express-app)

## ✅ Checklist de Despliegue

- [ ] Repositorio conectado a Render
- [ ] Variables de entorno de Firebase configuradas
- [ ] `FIREBASE_API_KEY` configurada (crucial para login)
- [ ] `CORS_ORIGIN` apunta a tu frontend
- [ ] Build y Start commands correctos
- [ ] Health check funcionando
- [ ] Logs sin errores
- [ ] Prueba de registro de usuario
- [ ] Prueba de login con session cookies
- [ ] Prueba de logout
- [ ] WebRTC funcionando (si aplica)

## 🎉 ¡Listo!

Tu backend debería estar funcionando en:

```
https://tu-servicio.onrender.com
```

Endpoints disponibles:
- `POST /api/auth/register` - Registro
- `POST /api/auth/login` - Login (crea session cookie)
- `POST /api/auth/logout` - Logout (elimina session cookie)
- `GET /api/users/profile` - Perfil del usuario
- `GET /health` - Health check

## 🔐 Importante sobre Session Cookies

Las session cookies funcionarán correctamente en producción porque:

1. ✅ `httpOnly: true` - No accesible desde JavaScript
2. ✅ `secure: true` - Solo HTTPS en producción
3. ✅ `sameSite: 'lax'` - Protección CSRF
4. ✅ Duración: 5 días

Asegúrate de que tu frontend esté configurado para enviar cookies:

```javascript
// En tu frontend (fetch/axios)
fetch('https://tu-api.onrender.com/api/auth/login', {
  method: 'POST',
  credentials: 'include', // ← IMPORTANTE
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ email, password }),
});
```

