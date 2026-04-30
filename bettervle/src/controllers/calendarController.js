const pool = require('../config/db');

async function getCourseEvents(req, res) {
  const { courseCode } = req.params;
  const [rows] = await pool.query(
    `SELECT event_id, course_code, title, event_details, event_date
     FROM calendar_events
     WHERE course_code = ?
     ORDER BY event_date, event_id`,
    [courseCode]
  );
  return res.json(rows);
}

async function createCourseEvent(req, res) {
  const { courseCode } = req.params;
  const { title, event_details, event_date } = req.body;

  if (!title || !event_date) {
    return res.status(400).json({ message: 'title and event_date are required.' });
  }

  await pool.query(
    `INSERT INTO calendar_events (course_code, title, event_details, event_date)
     VALUES (?, ?, ?, ?)`,
    [courseCode, title, event_details || null, event_date]
  );

  return res.status(201).json({ message: 'Calendar event created successfully.' });
}

async function getStudentEventsByDate(req, res) {
  const { studentId } = req.params;
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ message: 'date query parameter is required.' });
  }

  const [rows] = await pool.query(
    `SELECT ce.event_id, ce.course_code, c.course_title, ce.title, ce.event_details, ce.event_date
     FROM enroll e
     JOIN calendar_events ce ON ce.course_code = e.course_code
     JOIN courses c ON c.course_code = ce.course_code
     WHERE e.student_id = ? AND ce.event_date = ?
     ORDER BY ce.course_code, ce.event_id`,
    [studentId, date]
  );

  return res.json(rows);
}

async function updateCalendarEvent(req, res) {
  const { eventId } = req.params;
  const { title, event_details, event_date } = req.body;

  const [result] = await pool.query(
    `UPDATE calendar_events 
     SET title = COALESCE(?, title), 
         event_details = COALESCE(?, event_details), 
         event_date = COALESCE(?, event_date)
     WHERE event_id = ?`,
    [title, event_details, event_date, eventId]
  );

  if (result.affectedRows === 0) {
    return res.status(404).json({ message: 'Event not found.' });
  }

  return res.json({ message: 'Event updated successfully.' });
}

async function deleteCalendarEvent(req, res) {
  const { eventId } = req.params;

  const [result] = await pool.query('DELETE FROM calendar_events WHERE event_id = ?', [eventId]);

  if (result.affectedRows === 0) {
    return res.status(404).json({ message: 'Event not found.' });
  }

  return res.json({ message: 'Event deleted successfully.' });
}

async function getStudentUpcomingEvents(req, res) {
  const { studentId } = req.params;

  const [rows] = await pool.query(
    `SELECT ce.event_id, ce.course_code, c.course_title, ce.title, ce.event_details, ce.event_date
     FROM enroll e
     JOIN calendar_events ce ON ce.course_code = e.course_code
     JOIN courses c ON c.course_code = ce.course_code
     WHERE e.student_id = ? 
       AND ce.event_date >= CURDATE() 
       AND ce.event_date <= DATE_ADD(CURDATE(), INTERVAL 7 DAY)
     ORDER BY ce.event_date, ce.course_code`,
    [studentId]
  );

  return res.json(rows);
}

module.exports = { getCourseEvents, createCourseEvent, getStudentEventsByDate, updateCalendarEvent, deleteCalendarEvent, getStudentUpcomingEvents };
