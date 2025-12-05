import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';

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

    /**
     * Handle joining a meeting room
     * @param {Object} data - Join meeting data
     * @param {string} data.meetingId - Meeting ID to join
     * @param {string} data.userId - User ID joining the meeting
     */
    socket.on('join-meeting', (data: { meetingId: string; userId: string }) => {
      const { meetingId, userId } = data;
      socket.join(meetingId);
      console.log(`👤 User ${userId} joined meeting ${meetingId}`);
      
      // Notify other users in the room
      socket.to(meetingId).emit('user-joined', { userId, socketId: socket.id });
    });

    /**
     * Handle leaving a meeting room
     * @param {Object} data - Leave meeting data
     * @param {string} data.meetingId - Meeting ID to leave
     * @param {string} data.userId - User ID leaving the meeting
     */
    socket.on('leave-meeting', (data: { meetingId: string; userId: string }) => {
      const { meetingId, userId } = data;
      socket.leave(meetingId);
      console.log(`👋 User ${userId} left meeting ${meetingId}`);
      
      // Notify other users in the room
      socket.to(meetingId).emit('user-left', { userId, socketId: socket.id });
    });

    /**
     * Handle chat messages
     * @param {Object} data - Chat message data
     * @param {string} data.meetingId - Meeting ID where message is sent
     * @param {string} data.message - Message content
     * @param {string} data.userId - User ID sending the message
     * @param {string} data.userName - User name sending the message
     */
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

    /**
     * Handle WebRTC offer for audio/video connection
     * @param {Object} data - WebRTC offer data
     * @param {string} data.meetingId - Meeting ID
     * @param {any} data.offer - RTCSessionDescriptionInit offer
     * @param {string} data.targetUserId - Target user ID to send offer to
     */
    socket.on('webrtc-offer', (data: { meetingId: string; offer: any; targetUserId: string }) => {
      socket.to(data.meetingId).emit('webrtc-offer', {
        offer: data.offer,
        fromUserId: socket.id,
        targetUserId: data.targetUserId,
      });
    });

    /**
     * Handle WebRTC answer for audio/video connection
     * @param {Object} data - WebRTC answer data
     * @param {string} data.meetingId - Meeting ID
     * @param {any} data.answer - RTCSessionDescriptionInit answer
     * @param {string} data.targetUserId - Target user ID to send answer to
     */
    socket.on('webrtc-answer', (data: { meetingId: string; answer: any; targetUserId: string }) => {
      socket.to(data.meetingId).emit('webrtc-answer', {
        answer: data.answer,
        fromUserId: socket.id,
        targetUserId: data.targetUserId,
      });
    });

    /**
     * Handle WebRTC ICE candidate for audio/video connection
     * @param {Object} data - WebRTC ICE candidate data
     * @param {string} data.meetingId - Meeting ID
     * @param {any} data.candidate - RTCIceCandidateInit candidate
     * @param {string} data.targetUserId - Target user ID to send candidate to
     */
    socket.on('webrtc-ice-candidate', (data: { meetingId: string; candidate: any; targetUserId: string }) => {
      socket.to(data.meetingId).emit('webrtc-ice-candidate', {
        candidate: data.candidate,
        fromUserId: socket.id,
        targetUserId: data.targetUserId,
      });
    });

    /**
     * Handle microphone toggle
     * @param {Object} data - Microphone toggle data
     * @param {string} data.meetingId - Meeting ID
     * @param {string} data.userId - User ID toggling microphone
     * @param {boolean} data.isMuted - Whether microphone is muted
     */
    socket.on('toggle-microphone', (data: { meetingId: string; userId: string; isMuted: boolean }) => {
      socket.to(data.meetingId).emit('microphone-toggled', {
        userId: data.userId,
        isMuted: data.isMuted,
      });
    });

    /**
     * Handle camera toggle
     * @param {Object} data - Camera toggle data
     * @param {string} data.meetingId - Meeting ID
     * @param {string} data.userId - User ID toggling camera
     * @param {boolean} data.isVideoOff - Whether camera is off
     */
    socket.on('toggle-camera', (data: { meetingId: string; userId: string; isVideoOff: boolean }) => {
      socket.to(data.meetingId).emit('camera-toggled', {
        userId: data.userId,
        isVideoOff: data.isVideoOff,
      });
    });

    /**
     * Handle client disconnection
     */
    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

