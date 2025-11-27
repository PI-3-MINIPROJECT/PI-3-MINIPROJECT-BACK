# API Documentation - User Backend (API Gateway)

Complete API reference for PI-3-MINIPROJECT-BACK

## Base URL

```
Development: http://localhost:3000
Production:  https://your-app.onrender.com
```

## Authentication

All protected endpoints require session cookie. Cookie is set automatically on login.

```javascript
// Include credentials in requests
fetch('http://localhost:3000/api/endpoint', {
  credentials: 'include'
});
```

---

## 🔐 Authentication Endpoints

### Register
```
POST /api/auth/register

Body:
{
  "email": "user@example.com",
  "password": "password123",
  "displayName": "John Doe"
}

Response 201:
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "uid": "user123",
    "email": "user@example.com",
    "displayName": "John Doe"
  }
}
```

### Login
```
POST /api/auth/login

Body:
{
  "email": "user@example.com",
  "password": "password123"
}

Response 200:
{
  "success": true,
  "message": "Login successful",
  "user": {
    "uid": "user123",
    "email": "user@example.com",
    "displayName": "John Doe"
  }
}

Sets Cookie: session=xxx; HttpOnly
```

### Logout
```
POST /api/auth/logout

Response 200:
{
  "success": true,
  "message": "Logout successful"
}
```

### Get Current User
```
GET /api/auth/me

Response 200:
{
  "success": true,
  "user": {
    "uid": "user123",
    "email": "user@example.com",
    "displayName": "John Doe"
  }
}
```

### Password Reset
```
POST /api/auth/forgot-password

Body:
{
  "email": "user@example.com"
}

Response 200:
{
  "success": true,
  "message": "Password reset email sent"
}
```

---

## 👤 User Endpoints

### Get User Profile
```
GET /api/users/:userId

Response 200:
{
  "success": true,
  "data": {
    "uid": "user123",
    "email": "user@example.com",
    "displayName": "John Doe",
    "createdAt": "2024-01-15T10:00:00.000Z"
  }
}
```

### Update User Profile
```
PUT /api/users/:userId

Body:
{
  "displayName": "Jane Doe",
  "photoURL": "https://..."
}

Response 200:
{
  "success": true,
  "message": "User updated successfully",
  "data": { /* updated user */ }
}
```

### Delete User
```
DELETE /api/users/:userId

Response 200:
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

## 🎥 Meeting Endpoints

**Note:** These are proxied to Chat Backend

### Create Meeting
```
POST /api/meetings

Body:
{
  "title": "Team Meeting",
  "description": "Weekly sync"
}

Response 201:
{
  "success": true,
  "message": "Meeting created successfully",
  "data": {
    "meetingId": "abc123def456",
    "hostId": "user123",
    "title": "Team Meeting",
    "description": "Weekly sync",
    "participants": ["user123"],
    "activeParticipants": 0,
    "createdAt": "2024-01-15T10:00:00.000Z",
    "status": "active"
  }
}
```

### Get User's Meetings
```
GET /api/meetings

Response 200:
{
  "success": true,
  "data": [
    {
      "id": "abc123",
      "meetingId": "abc123",
      "hostId": "user123",
      "title": "Team Meeting",
      "participants": ["user123", "user456"],
      "activeParticipants": 0,
      "createdAt": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

### Get Meeting by ID
```
GET /api/meetings/:meetingId

Response 200:
{
  "success": true,
  "data": {
    "id": "abc123",
    "meetingId": "abc123",
    "hostId": "user123",
    "title": "Team Meeting",
    "description": "Weekly sync",
    "participants": ["user123", "user456"],
    "activeParticipants": 1,
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T11:00:00.000Z",
    "status": "active"
  }
}
```

### Update Meeting
```
PUT /api/meetings/:meetingId

Body:
{
  "title": "Updated Title",
  "description": "Updated description",
  "status": "ended"
}

Response 200:
{
  "success": true,
  "message": "Meeting updated successfully",
  "data": { /* updated meeting */ }
}
```

### Delete Meeting
```
DELETE /api/meetings/:meetingId

Response 200:
{
  "success": true,
  "message": "Meeting deleted successfully"
}
```

### Join Meeting
```
POST /api/meetings/:meetingId/join

Response 200:
{
  "success": true,
  "message": "Joined meeting successfully",
  "data": { /* updated meeting */ }
}
```

### Leave Meeting
```
POST /api/meetings/:meetingId/leave

Response 200:
{
  "success": true,
  "message": "Left meeting successfully"
}
```

---

## 🔌 WebSocket (Socket.io)

### Connection
```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3000', {
  withCredentials: true  // Important for session
});
```

### Events

#### Join Meeting
```javascript
socket.emit('join:meeting', {
  meetingId: 'abc123',
  userId: 'user123',
  username: 'John Doe'
});
```

#### Send Message
```javascript
socket.emit('chat:message', {
  meetingId: 'abc123',
  userId: 'user123',
  username: 'John Doe',
  message: 'Hello everyone!'
});
```

#### Leave Meeting
```javascript
socket.emit('leave:meeting', 'abc123');
```

#### Typing Indicators
```javascript
socket.emit('typing:start', {
  meetingId: 'abc123',
  userId: 'user123',
  username: 'John Doe'
});

socket.emit('typing:stop', {
  meetingId: 'abc123',
  userId: 'user123',
  username: 'John Doe'
});
```

### Listen for Events

```javascript
// User joined
socket.on('user:joined', (data) => {
  console.log(data); // { userId, username, timestamp }
});

// User left
socket.on('user:left', (data) => {
  console.log(data); // { userId, username, timestamp }
});

// Users online
socket.on('users:online', (data) => {
  console.log(data); // { meetingId, participants: [...], count }
});

// Chat message
socket.on('chat:message', (message) => {
  console.log(message); 
  // { messageId, meetingId, userId, username, message, timestamp }
});

// Typing indicators
socket.on('typing:start', (data) => {
  console.log(data); // { userId, username }
});

socket.on('typing:stop', (data) => {
  console.log(data); // { userId, username }
});

// Errors
socket.on('error', (error) => {
  console.error(error); // { message }
});
```

---

## ❌ Error Responses

All endpoints may return errors in this format:

```json
{
  "success": false,
  "message": "Error description"
}
```

Common status codes:
- `400` - Bad Request
- `401` - Unauthorized (not logged in)
- `403` - Forbidden (not allowed)
- `404` - Not Found
- `500` - Internal Server Error

---

## 🧪 Testing Examples

### Register and Login
```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456","displayName":"Test User"}' \
  -c cookies.txt

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456"}' \
  -c cookies.txt

# Get current user
curl http://localhost:3000/api/auth/me \
  -b cookies.txt
```

### Meeting Operations
```bash
# Create meeting
curl -X POST http://localhost:3000/api/meetings \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"title":"Test Meeting","description":"Test"}'

# Get meetings
curl http://localhost:3000/api/meetings \
  -b cookies.txt

# Join meeting
curl -X POST http://localhost:3000/api/meetings/abc123/join \
  -b cookies.txt
```

---

**API Gateway:** All meeting endpoints are proxied to Chat Backend internally.

