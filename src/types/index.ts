/**
 * User interface
 * @interface User
 * @property {string} uid - User unique identifier
 * @property {string} email - User email address
 * @property {string} name - User first name
 * @property {string} last_name - User last name
 * @property {number} age - User age
 * @property {string} createdAt - User creation timestamp (ISO string)
 * @property {string} updatedAt - User last update timestamp (ISO string)
 */
export interface User {
  uid: string;
  email: string;
  name: string;
  last_name: string;
  age: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Meeting interface
 * @interface Meeting
 * @property {string} meetingId - Meeting unique identifier
 * @property {string} hostId - Host user ID
 * @property {string} title - Meeting title
 * @property {string} description - Meeting description
 * @property {string[]} participants - Array of participant user IDs
 * @property {string} createdAt - Meeting creation timestamp (ISO string)
 * @property {string} updatedAt - Meeting last update timestamp (ISO string)
 * @property {'active' | 'ended'} status - Meeting status
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
 * @interface ChatMessage
 * @property {string} meetingId - Meeting ID where message was sent
 * @property {string} userId - User ID who sent the message
 * @property {string} userName - User name who sent the message
 * @property {string} message - Message content
 * @property {string} timestamp - Message timestamp (ISO string)
 */
export interface ChatMessage {
  meetingId: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: string;
}

/**
 * WebRTC offer interface
 * @interface WebRTCOffer
 * @property {string} meetingId - Meeting ID
 * @property {any} offer - RTCSessionDescriptionInit offer
 * @property {string} targetUserId - Target user ID to send offer to
 * @property {string} fromUserId - User ID sending the offer
 */
export interface WebRTCOffer {
  meetingId: string;
  offer: any; // RTCSessionDescriptionInit
  targetUserId: string;
  fromUserId: string;
}

/**
 * WebRTC answer interface
 * @interface WebRTCAnswer
 * @property {string} meetingId - Meeting ID
 * @property {any} answer - RTCSessionDescriptionInit answer
 * @property {string} targetUserId - Target user ID to send answer to
 * @property {string} fromUserId - User ID sending the answer
 */
export interface WebRTCAnswer {
  meetingId: string;
  answer: any; // RTCSessionDescriptionInit
  targetUserId: string;
  fromUserId: string;
}

/**
 * WebRTC ICE candidate interface
 * @interface WebRTCIceCandidate
 * @property {string} meetingId - Meeting ID
 * @property {any} candidate - RTCIceCandidateInit candidate
 * @property {string} targetUserId - Target user ID to send candidate to
 * @property {string} fromUserId - User ID sending the candidate
 */
export interface WebRTCIceCandidate {
  meetingId: string;
  candidate: any; // RTCIceCandidateInit
  targetUserId: string;
  fromUserId: string;
}

