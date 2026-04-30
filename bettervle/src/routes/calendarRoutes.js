const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { authenticate, authorize } = require('../middleware/auth');
const {
  getCourseEvents,
  createCourseEvent,
  getStudentEventsByDate,
  updateCalendarEvent,
  deleteCalendarEvent,
  getStudentUpcomingEvents,
} = require('../controllers/calendarController');

const router = express.Router();

router.get('/courses/:courseCode/events', authenticate, asyncHandler(getCourseEvents));
router.post('/courses/:courseCode/events', authenticate, authorize('admin', 'lecturer'), asyncHandler(createCourseEvent));
router.get('/students/:studentId/events', authenticate, asyncHandler(getStudentEventsByDate));
router.put('/events/:eventId', authenticate, authorize('admin', 'lecturer'), asyncHandler(updateCalendarEvent));
router.delete('/events/:eventId', authenticate, authorize('admin', 'lecturer'), asyncHandler(deleteCalendarEvent));
router.get('/students/:studentId/upcoming', authenticate, asyncHandler(getStudentUpcomingEvents));


module.exports = router;
