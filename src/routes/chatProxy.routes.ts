import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import {
  createMeeting,
  getUserMeetings,
  getMeetingById,
  joinMeeting,
  leaveMeeting,
  deleteMeeting,
  updateMeeting,
} from '../controllers/chatProxy.controller';

const router = Router();

/**
 * @route   POST /api/meetings
 * @desc    Create a new meeting (proxied to Chat Backend)
 * @access  Private
 */
router.post('/', authenticate, createMeeting);

/**
 * @route   GET /api/meetings
 * @desc    Get all meetings for current user (proxied to Chat Backend)
 * @access  Private
 */
router.get('/', authenticate, getUserMeetings);

/**
 * @route   GET /api/meetings/:meetingId
 * @desc    Get meeting by ID (proxied to Chat Backend)
 * @access  Private
 */
router.get('/:meetingId', authenticate, getMeetingById);

/**
 * @route   POST /api/meetings/:meetingId/join
 * @desc    Join a meeting (proxied to Chat Backend)
 * @access  Private
 */
router.post('/:meetingId/join', authenticate, joinMeeting);

/**
 * @route   POST /api/meetings/:meetingId/leave
 * @desc    Leave a meeting (proxied to Chat Backend)
 * @access  Private
 */
router.post('/:meetingId/leave', authenticate, leaveMeeting);

/**
 * @route   PUT /api/meetings/:meetingId
 * @desc    Update a meeting (proxied to Chat Backend)
 * @access  Private
 */
router.put('/:meetingId', authenticate, updateMeeting);

/**
 * @route   DELETE /api/meetings/:meetingId
 * @desc    Delete a meeting (proxied to Chat Backend)
 * @access  Private
 */
router.delete('/:meetingId', authenticate, deleteMeeting);

export default router;

