const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { authenticate, authorize } = require('../middleware/auth');
const {
  getCourses50Plus,
  getStudents5Plus,
  getLecturers3Plus,
  getTop10Courses,
  getTop10Students,
} = require('../controllers/reportController');

const router = express.Router();

router.get('/courses-50-plus', authenticate, authorize('admin'), asyncHandler(getCourses50Plus));
router.get('/students-5-plus', authenticate, authorize('admin'), asyncHandler(getStudents5Plus));
router.get('/lecturers-3-plus', authenticate, authorize('admin'), asyncHandler(getLecturers3Plus));
router.get('/top-10-courses', authenticate, authorize('admin'), asyncHandler(getTop10Courses));
router.get('/top-10-students', authenticate, authorize('admin'), asyncHandler(getTop10Students));

module.exports = router;
