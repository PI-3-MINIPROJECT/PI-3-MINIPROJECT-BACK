import { Request, Response, NextFunction } from 'express';
import { getFirestoreInstance } from '../config/firebase';
import { createError } from '../middlewares/errorHandler';

/**
 * Generate a unique meeting ID
 * @returns {string} Unique meeting ID
 */
const generateMeetingId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

/**
 * Create a new meeting
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 */
export const createMeeting = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.uid;

    if (!userId) {
      throw createError('User not authenticated', 401);
    }

    const { title, description } = req.body;
    const db = getFirestoreInstance();
    const meetingId = generateMeetingId();

    const meetingData = {
      meetingId,
      hostId: userId,
      title: title || `Meeting ${meetingId}`,
      description: description || '',
      participants: [userId],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'active',
    };

    await db.collection('meetings').doc(meetingId).set(meetingData);

    res.status(201).json({
      success: true,
      message: 'Meeting created successfully',
      data: meetingData,
    });
  } catch (error: any) {
    if (error.statusCode) {
      next(error);
    } else {
      next(createError('Error creating meeting', 500));
    }
  }
};

/**
 * Get all meetings for current user
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 */
export const getUserMeetings = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.uid;

    if (!userId) {
      throw createError('User not authenticated', 401);
    }

    const db = getFirestoreInstance();

    // Get meetings where user is host or participant
    const meetingsSnapshot = await db
      .collection('meetings')
      .where('participants', 'array-contains', userId)
      .orderBy('createdAt', 'desc')
      .get();

    const meetings = meetingsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json({
      success: true,
      data: meetings,
    });
  } catch (error: any) {
    if (error.statusCode) {
      next(error);
    } else {
      next(createError('Error fetching meetings', 500));
    }
  }
};

/**
 * Get meeting by ID
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 */
export const getMeetingById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { meetingId } = req.params;
    const db = getFirestoreInstance();

    const meetingDoc = await db.collection('meetings').doc(meetingId).get();

    if (!meetingDoc.exists) {
      throw createError('Meeting not found', 404);
    }

    res.status(200).json({
      success: true,
      data: {
        id: meetingDoc.id,
        ...meetingDoc.data(),
      },
    });
  } catch (error: any) {
    if (error.statusCode) {
      next(error);
    } else {
      next(createError('Error fetching meeting', 500));
    }
  }
};

/**
 * Join a meeting
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 */
export const joinMeeting = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.uid;

    if (!userId) {
      throw createError('User not authenticated', 401);
    }

    const { meetingId } = req.params;
    const db = getFirestoreInstance();

    const meetingDoc = await db.collection('meetings').doc(meetingId).get();

    if (!meetingDoc.exists) {
      throw createError('Meeting not found', 404);
    }

    const meetingData = meetingDoc.data();
    const participants = meetingData?.participants || [];

    // Check if user is already in the meeting
    if (!participants.includes(userId)) {
      // Check meeting capacity (2-10 participants)
      if (participants.length >= 10) {
        throw createError('Meeting is full (maximum 10 participants)', 403);
      }

      // Add user to participants
      participants.push(userId);

      await db.collection('meetings').doc(meetingId).update({
        participants,
        updatedAt: new Date().toISOString(),
      });
    }

    const updatedMeeting = await db.collection('meetings').doc(meetingId).get();

    res.status(200).json({
      success: true,
      message: 'Joined meeting successfully',
      data: {
        id: updatedMeeting.id,
        ...updatedMeeting.data(),
      },
    });
  } catch (error: any) {
    if (error.statusCode) {
      next(error);
    } else {
      next(createError('Error joining meeting', 500));
    }
  }
};

/**
 * Leave a meeting
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 */
export const leaveMeeting = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.uid;

    if (!userId) {
      throw createError('User not authenticated', 401);
    }

    const { meetingId } = req.params;
    const db = getFirestoreInstance();

    const meetingDoc = await db.collection('meetings').doc(meetingId).get();

    if (!meetingDoc.exists) {
      throw createError('Meeting not found', 404);
    }

    const meetingData = meetingDoc.data();
    const participants = meetingData?.participants || [];

    // Remove user from participants
    const updatedParticipants = participants.filter((id: string) => id !== userId);

    await db.collection('meetings').doc(meetingId).update({
      participants: updatedParticipants,
      updatedAt: new Date().toISOString(),
    });

    res.status(200).json({
      success: true,
      message: 'Left meeting successfully',
    });
  } catch (error: any) {
    if (error.statusCode) {
      next(error);
    } else {
      next(createError('Error leaving meeting', 500));
    }
  }
};

/**
 * Delete a meeting
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 */
export const deleteMeeting = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.uid;

    if (!userId) {
      throw createError('User not authenticated', 401);
    }

    const { meetingId } = req.params;
    const db = getFirestoreInstance();

    const meetingDoc = await db.collection('meetings').doc(meetingId).get();

    if (!meetingDoc.exists) {
      throw createError('Meeting not found', 404);
    }

    const meetingData = meetingDoc.data();

    // Only host can delete the meeting
    if (meetingData?.hostId !== userId) {
      throw createError('Only the host can delete the meeting', 403);
    }

    await db.collection('meetings').doc(meetingId).delete();

    res.status(200).json({
      success: true,
      message: 'Meeting deleted successfully',
    });
  } catch (error: any) {
    if (error.statusCode) {
      next(error);
    } else {
      next(createError('Error deleting meeting', 500));
    }
  }
};

