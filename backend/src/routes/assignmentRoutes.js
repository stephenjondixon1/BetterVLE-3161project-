const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { authenticate, authorize } = require('../middleware/auth');
const {
  createAssignment,
  submitAssignment,
  gradeSubmission,
  getStudentAssignmentSubmissions,
  getAssignmentDetails,
  getStudentSubmission,
  updateAssignment,
  deleteAssignment
} = require('../controllers/assignmentController');

const router = express.Router();

router.post('/courses/:courseCode/assignments', authenticate, authorize('lecturer', 'admin'), asyncHandler(createAssignment));
router.post('/assignments/:assignmentId/submissions', authenticate, authorize('student', 'admin'), asyncHandler(submitAssignment));
router.put('/assignments/:assignmentId/submissions/:studentId/grade', authenticate, authorize('lecturer', 'admin'), asyncHandler(gradeSubmission));
router.get('/students/:studentId/submissions', authenticate, asyncHandler(getStudentAssignmentSubmissions));
router.get('/assignments/:assignmentId', authenticate, asyncHandler(getAssignmentDetails));
router.get('/assignments/:assignmentId/students/:studentId', authenticate, asyncHandler(getStudentSubmission));
router.put('/assignments/:assignmentId', authenticate, authorize('lecturer', 'admin'), asyncHandler(updateAssignment));
router.delete('/assignments/:assignmentId', authenticate, authorize('lecturer', 'admin'), asyncHandler(deleteAssignment));

module.exports = router;
