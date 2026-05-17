const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { authenticate, authorize } = require('../middleware/auth');
const {
  createSection,
  addLink,
  addSlide,
  addFile,
  getCourseContent,
} = require('../controllers/contentController');

const router = express.Router();

router.get('/courses/:courseCode/content', authenticate, asyncHandler(getCourseContent));
router.post('/courses/:courseCode/sections', authenticate, authorize('lecturer', 'admin'), asyncHandler(createSection));
router.post('/sections/:sectionId/links', authenticate, authorize('lecturer', 'admin'), asyncHandler(addLink));
router.post('/sections/:sectionId/slides', authenticate, authorize('lecturer', 'admin'), asyncHandler(addSlide));
router.post('/sections/:sectionId/files', authenticate, authorize('lecturer', 'admin'), asyncHandler(addFile));

module.exports = router;
