const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { authenticate, authorize } = require('../middleware/auth');
const {
  getAllStudents,
  getAllLecturers,
  getStudentCourseGrade,
  getAssignmentSubmissions,
  getCourseAssignments,
  getStudentPerformanceSummary
} = require('../controllers/userController');

const router = express.Router();

router.get('/students', authenticate, authorize('admin'), asyncHandler(getAllStudents));
router.get('/lecturers', authenticate, authorize('admin'), asyncHandler(getAllLecturers));

router.get('/students/:studentId/courses/:courseCode/grade', authenticate, asyncHandler(getStudentCourseGrade));
router.get('/students/:studentId/performance', authenticate, asyncHandler(getStudentPerformanceSummary));

router.get('/assignments/:assignmentId/submissions', authenticate, authorize('lecturer', 'admin'), asyncHandler(getAssignmentSubmissions));
router.get('/courses/:courseCode/assignments', authenticate, asyncHandler(getCourseAssignments));

module.exports = router;