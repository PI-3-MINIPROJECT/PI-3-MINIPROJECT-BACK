import { Request, Response, NextFunction } from 'express';
import { createError } from '../middlewares/errorHandler';

const CHAT_BACKEND_URL = process.env.CHAT_BACKEND_URL || 'http://localhost:4000';

/**
 * Proxy request to Chat Backend
 * @param {string} path - Path to proxy to
 * @param {string} method - HTTP method
 * @param {any} body - Request body
 * @param {Request} req - Express request
 * @returns {Promise<any>} Response from Chat Backend
 */
async function proxyToChatBackend(
  path: string,
  method: string = 'GET',
  body?: any,
  _req?: Request
): Promise<any> {
  try {
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${CHAT_BACKEND_URL}${path}`, options);

    if (!response.ok) {
      const errorData: any = await response.json();
      throw new Error(errorData.message || 'Error from Chat Backend');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error proxying to Chat Backend:', error);
    throw error;
  }
}

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

    const data = await proxyToChatBackend('/api/meetings', 'POST', {
      userId,
      title,
      description,
    });

    res.status(201).json(data);
  } catch (error: any) {
    if (error.statusCode) {
      next(error);
    } else {
      next(createError(error.message || 'Error creating meeting', 500));
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

    const data = await proxyToChatBackend(`/api/meetings/user/${userId}`);

    res.status(200).json(data);
  } catch (error: any) {
    if (error.statusCode) {
      next(error);
    } else {
      next(createError(error.message || 'Error fetching meetings', 500));
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

    const data = await proxyToChatBackend(`/api/meetings/${meetingId}`);

    res.status(200).json(data);
  } catch (error: any) {
    if (error.statusCode) {
      next(error);
    } else {
      next(createError(error.message || 'Error fetching meeting', 500));
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

    const data = await proxyToChatBackend(
      `/api/meetings/${meetingId}/join`,
      'POST',
      { userId }
    );

    res.status(200).json(data);
  } catch (error: any) {
    if (error.statusCode) {
      next(error);
    } else {
      next(createError(error.message || 'Error joining meeting', 500));
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

    const data = await proxyToChatBackend(
      `/api/meetings/${meetingId}/leave`,
      'POST',
      { userId }
    );

    res.status(200).json(data);
  } catch (error: any) {
    if (error.statusCode) {
      next(error);
    } else {
      next(createError(error.message || 'Error leaving meeting', 500));
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

    const data = await proxyToChatBackend(
      `/api/meetings/${meetingId}`,
      'DELETE',
      { userId }
    );

    res.status(200).json(data);
  } catch (error: any) {
    if (error.statusCode) {
      next(error);
    } else {
      next(createError(error.message || 'Error deleting meeting', 500));
    }
  }
};

/**
 * Update a meeting
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 */
export const updateMeeting = async (
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
    const { title, description, status } = req.body;

    const data = await proxyToChatBackend(
      `/api/meetings/${meetingId}`,
      'PUT',
      { userId, title, description, status }
    );

    res.status(200).json(data);
  } catch (error: any) {
    if (error.statusCode) {
      next(error);
    } else {
      next(createError(error.message || 'Error updating meeting', 500));
    }
  }
};

