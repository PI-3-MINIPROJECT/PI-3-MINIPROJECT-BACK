import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';

/**
 * Initialize Socket.IO server
 * @param {HTTPServer} httpServer - HTTP server instance
 * @returns {Server} Socket.IO server instance
 */
export const initializeSocketIO = (httpServer: HTTPServer): Server => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // Socket.IO connection handler
  io.on('connection', (socket: Socket) => {
    console.log(`✅ Client connected: ${socket.id}`);

    // Handle joining a meeting room
    socket.on('join-meeting', (data: { meetingId: string; userId: string }) => {
      const { meetingId, userId } = data;
      socket.join(meetingId);
      console.log(`👤 User ${userId} joined meeting ${meetingId}`);
      
      // Notify other users in the room
      socket.to(meetingId).emit('user-joined', { userId, socketId: socket.id });
    });

    // Handle leaving a meeting room
    socket.on('leave-meeting', (data: { meetingId: string; userId: string }) => {
      const { meetingId, userId } = data;
      socket.leave(meetingId);
      console.log(`👋 User ${userId} left meeting ${meetingId}`);
      
      // Notify other users in the room
      socket.to(meetingId).emit('user-left', { userId, socketId: socket.id });
    });

    // Handle chat messages
    socket.on('chat-message', (data: { meetingId: string; message: string; userId: string; userName: string }) => {
      const { meetingId, message, userId, userName } = data;
      console.log(`💬 Chat message in meeting ${meetingId} from ${userName}`);
      
      // Broadcast message to all users in the meeting (including sender)
      io.to(meetingId).emit('chat-message', {
        message,
        userId,
        userName,
        timestamp: new Date().toISOString(),
      });
    });

    // Handle WebRTC signaling for audio/video
    socket.on('webrtc-offer', (data: { meetingId: string; offer: any; targetUserId: string }) => {
      socket.to(data.meetingId).emit('webrtc-offer', {
        offer: data.offer,
        fromUserId: socket.id,
        targetUserId: data.targetUserId,
      });
    });

    socket.on('webrtc-answer', (data: { meetingId: string; answer: any; targetUserId: string }) => {
      socket.to(data.meetingId).emit('webrtc-answer', {
        answer: data.answer,
        fromUserId: socket.id,
        targetUserId: data.targetUserId,
      });
    });

    socket.on('webrtc-ice-candidate', (data: { meetingId: string; candidate: any; targetUserId: string }) => {
      socket.to(data.meetingId).emit('webrtc-ice-candidate', {
        candidate: data.candidate,
        fromUserId: socket.id,
        targetUserId: data.targetUserId,
      });
    });

    // Handle microphone toggle
    socket.on('toggle-microphone', (data: { meetingId: string; userId: string; isMuted: boolean }) => {
      socket.to(data.meetingId).emit('microphone-toggled', {
        userId: data.userId,
        isMuted: data.isMuted,
      });
    });

    // Handle camera toggle
    socket.on('toggle-camera', (data: { meetingId: string; userId: string; isVideoOff: boolean }) => {
      socket.to(data.meetingId).emit('camera-toggled', {
        userId: data.userId,
        isVideoOff: data.isVideoOff,
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

