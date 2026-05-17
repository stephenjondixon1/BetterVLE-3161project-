const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { authenticate } = require('../middleware/auth');
const {
  getCourseForums,
  createForum,
  getThreads,
  createThread,
  addReply,
  getReplies,
} = require('../controllers/forumController');

const router = express.Router();

router.get('/courses/:courseCode/forums', authenticate, asyncHandler(getCourseForums));
router.post('/courses/:courseCode/forums', authenticate, asyncHandler(createForum));
router.get('/forums/:forumId/threads', authenticate, asyncHandler(getThreads));
router.post('/forums/:forumId/threads', authenticate, asyncHandler(createThread));
router.get('/threads/:threadId/replies', authenticate, asyncHandler(getReplies));
router.post('/threads/:threadId/replies', authenticate, asyncHandler(addReply));

module.exports = router;
