/**
 * User interface
 */
export interface User {
  uid: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Meeting interface
 */
export interface Meeting {
  meetingId: string;
  hostId: string;
  title: string;
  description: string;
  participants: string[];
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'ended';
}

/**
 * Chat message interface
 */
export interface ChatMessage {
  meetingId: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: string;
}

/**
 * WebRTC signaling data
 */
export interface WebRTCOffer {
  meetingId: string;
  offer: RTCSessionDescriptionInit;
  targetUserId: string;
  fromUserId: string;
}

export interface WebRTCAnswer {
  meetingId: string;
  answer: RTCSessionDescriptionInit;
  targetUserId: string;
  fromUserId: string;
}

export interface WebRTCIceCandidate {
  meetingId: string;
  candidate: RTCIceCandidateInit;
  targetUserId: string;
  fromUserId: string;
}

