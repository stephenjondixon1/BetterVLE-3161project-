const pool = require('../config/db');

async function getAllStudents(req, res) {
  const [rows] = await pool.query(
    `SELECT student_id, sf_name AS first_name, sl_name AS last_name, major, department, gpa
     FROM student
     ORDER BY student_id`
  );
  return res.json(rows);
}

async function getAllLecturers(req, res) {
  const [rows] = await pool.query(
    `SELECT lecturer_id, lf_name AS first_name, ll_name AS last_name, department
     FROM lecturer
     ORDER BY lecturer_id`
  );
  return res.json(rows);
}

async function getStudentCourseGrade(req, res) {
  const { studentId, courseCode } = req.params;

  const [rows] = await pool.query(
    `SELECT e.student_id, e.course_code, c.course_title, 
            e.grade AS final_grade,
            (SELECT ROUND(AVG(s.submission_grade), 2) 
             FROM submits s 
             JOIN assignment a ON a.assign_id = s.assign_id 
             WHERE s.student_id = e.student_id AND a.course_code = e.course_code
             AND s.submission_grade IS NOT NULL) AS assignment_average
     FROM enroll e
     JOIN courses c ON c.course_code = e.course_code
     WHERE e.student_id = ? AND e.course_code = ?`,
    [studentId, courseCode]
  );

  if (rows.length === 0) {
    return res.status(404).json({ message: 'Enrollment not found.' });
  }

  return res.json(rows[0]);
}

async function getAssignmentSubmissions(req, res) {
  const { assignmentId } = req.params;

  const [rows] = await pool.query(
    `SELECT s.student_id, 
            CONCAT(st.sf_name, ' ', st.sl_name) AS student_name,
            s.submission_content, 
            s.submission_date, 
            s.submission_grade,
            a.weight,
            a.course_code
     FROM submits s
     JOIN student st ON st.student_id = s.student_id
     JOIN assignment a ON a.assign_id = s.assign_id
     WHERE s.assign_id = ?
     ORDER BY s.submission_date DESC`,
    [assignmentId]
  );

  return res.json(rows);
}

async function getCourseAssignments(req, res) {
  const { courseCode } = req.params;

  const [rows] = await pool.query(
    `SELECT assign_id, weight, course_code
     FROM assignment
     WHERE course_code = ?
     ORDER BY assign_id`,
    [courseCode]
  );

  return res.json(rows);
}


async function getStudentPerformanceSummary(req, res) {
  const { studentId } = req.params;

  const [courses] = await pool.query(
    `SELECT c.course_code, c.course_title, e.grade,
            (SELECT COUNT(*) FROM assignment WHERE course_code = c.course_code) AS total_assignments,
            (SELECT COUNT(*) FROM submits s 
             JOIN assignment a ON a.assign_id = s.assign_id 
             WHERE s.student_id = ? AND a.course_code = c.course_code) AS submitted_assignments
     FROM enroll e
     JOIN courses c ON c.course_code = e.course_code
     WHERE e.student_id = ?`,
    [studentId, studentId]
  );

  const [overallAvg] = await pool.query(
    `SELECT AVG(grade) AS overall_average
     FROM enroll
     WHERE student_id = ? AND grade IS NOT NULL`,
    [studentId]
  );

  return res.json({
    student_id: studentId,
    overall_average: overallAvg[0]?.overall_average || null,
    courses: courses
  });
}

module.exports = {
  getAllStudents,
  getAllLecturers,
  getStudentCourseGrade,
  getAssignmentSubmissions,
  getCourseAssignments,
  getStudentPerformanceSummary
};