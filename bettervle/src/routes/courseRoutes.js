const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { authenticate, authorize } = require('../middleware/auth');
const {
  createCourse,
  getAllCourses,
  assignLecturer,
  getStudentCourses,
  getLecturerCourses,
  enrollStudent,
  getCourseMembers,
  getStudentCourseGrade,
  getAllCoursesWithStats,
  getAvailableCoursesForStudent,
  removeStudentFromCourse,
  updateCourse,
  deleteCourse
} = require('../controllers/courseController');

const router = express.Router();

router.get('/', asyncHandler(getAllCourses));
router.post('/', authenticate, authorize('admin'), asyncHandler(createCourse));
router.post('/:courseCode/assign-lecturer', authenticate, authorize('admin'), asyncHandler(assignLecturer));
router.post('/:courseCode/register', authenticate, authorize('student', 'admin'), asyncHandler(enrollStudent));
router.get('/:courseCode/members', authenticate, asyncHandler(getCourseMembers));
router.get('/students/:studentId', authenticate, asyncHandler(getStudentCourses));
router.get('/lecturers/:lecturerId', authenticate, asyncHandler(getLecturerCourses));
router.get('/students/:studentId/corses/:courseCode/grade', authenticate, asyncHandler(getStudentCourseGrade));
router.get('/with-stats', authenticate, authorize('admin'), asyncHandler(getAllCoursesWithStats));
router.get('/students/:studentId/available', authenticate, asyncHandler(getAvailableCoursesForStudent));
router.delete('/:courseCode/students/:studentId', authenticate, authorize('admin'), asyncHandler(removeStudentFromCourse));
router.put('/:courseCode', authenticate, authorize('admin'), asyncHandler(updateCourse));
router.delete('/:courseCode', authenticate, authorize('admin'), asyncHandler(deleteCourse));


module.exports = router;
