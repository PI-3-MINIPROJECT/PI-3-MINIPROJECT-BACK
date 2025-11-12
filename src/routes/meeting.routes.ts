import { Router } from 'express';
import { body } from 'express-validator';
import * as meetingController from '../controllers/meeting.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validateRequest } from '../utils/validation';

const router = Router();

// All meeting routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/meetings
 * @desc    Create a new meeting
 * @access  Private
 */
router.post(
  '/',
  [
    body('title').optional().trim().notEmpty(),
    body('description').optional().trim(),
  ],
  validateRequest,
  meetingController.createMeeting
);

/**
 * @route   GET /api/meetings
 * @desc    Get all meetings for current user
 * @access  Private
 */
router.get('/', meetingController.getUserMeetings);

/**
 * @route   GET /api/meetings/:meetingId
 * @desc    Get meeting by ID
 * @access  Private
 */
router.get('/:meetingId', meetingController.getMeetingById);

/**
 * @route   POST /api/meetings/:meetingId/join
 * @desc    Join a meeting
 * @access  Private
 */
router.post('/:meetingId/join', meetingController.joinMeeting);

/**
 * @route   POST /api/meetings/:meetingId/leave
 * @desc    Leave a meeting
 * @access  Private
 */
router.post('/:meetingId/leave', meetingController.leaveMeeting);

/**
 * @route   DELETE /api/meetings/:meetingId
 * @desc    Delete a meeting
 * @access  Private
 */
router.delete('/:meetingId', meetingController.deleteMeeting);

export default router;

