const pool = require('../config/db');

async function createCourse(req, res) {
  const { course_code, course_title } = req.body;

  if (!course_code || !course_title) {
    return res.status(400).json({ message: 'course_code and course_title are required.' });
  }

  const [adminRows] = await pool.query('SELECT admin_id FROM admin WHERE admin_id = ?', [req.user.user_id]);
  if (adminRows.length === 0) {
    return res.status(403).json({ message: 'Only admins can create courses.' });
  }

  await pool.query(
    'INSERT INTO courses (course_code, course_title, created_by) VALUES (?, ?, ?)',
    [course_code, course_title, req.user.user_id]
  );

  return res.status(201).json({ message: 'Course created successfully.' });
}

async function getAllCourses(req, res) {
  const [rows] = await pool.query(
    `SELECT c.course_code, c.course_title, c.created_by,
            CONCAT(l.lf_name, ' ', l.ll_name) AS lecturer_name,
            t.lecturer_id
     FROM courses c
     LEFT JOIN teaches t ON t.course_code = c.course_code
     LEFT JOIN lecturer l ON l.lecturer_id = t.lecturer_id
     ORDER BY c.course_code`
  );

  return res.json(rows);
}

async function assignLecturer(req, res) {
  const { courseCode } = req.params;
  const { lecturer_id } = req.body;

  if (!lecturer_id) {
    return res.status(400).json({ message: 'lecturer_id is required.' });
  }

  const [courseRows] = await pool.query('SELECT course_code FROM courses WHERE course_code = ?', [courseCode]);
  if (courseRows.length === 0) {
    return res.status(404).json({ message: 'Course not found.' });
  }

  const [lecturerRows] = await pool.query('SELECT lecturer_id FROM lecturer WHERE lecturer_id = ?', [lecturer_id]);
  if (lecturerRows.length === 0) {
    return res.status(404).json({ message: 'Lecturer not found.' });
  }

  const [assigned] = await pool.query('SELECT lecturer_id FROM teaches WHERE course_code = ?', [courseCode]);
  if (assigned.length > 0) {
    return res.status(409).json({ message: 'A lecturer is already assigned to this course.' });
  }

  const [teachingLoad] = await pool.query(
    'SELECT COUNT(*) AS total FROM teaches WHERE lecturer_id = ?',
    [lecturer_id]
  );
  if (teachingLoad[0].total >= 5) {
    return res.status(400).json({ message: 'This lecturer already teaches the maximum of 5 courses.' });
  }

  await pool.query('INSERT INTO teaches (lecturer_id, course_code) VALUES (?, ?)', [lecturer_id, courseCode]);
  return res.status(201).json({ message: 'Lecturer assigned successfully.' });
}

async function getStudentCourses(req, res) {
  const { studentId } = req.params;
  const [rows] = await pool.query(
    `SELECT c.course_code, c.course_title, e.grade,
            CONCAT(l.lf_name, ' ', l.ll_name) AS lecturer_name
     FROM enroll e
     JOIN courses c ON c.course_code = e.course_code
     LEFT JOIN teaches t ON t.course_code = c.course_code
     LEFT JOIN lecturer l ON l.lecturer_id = t.lecturer_id
     WHERE e.student_id = ?
     ORDER BY c.course_code`,
    [studentId]
  );

  return res.json(rows);
}

async function getLecturerCourses(req, res) {
  const { lecturerId } = req.params;
  const [rows] = await pool.query(
    `SELECT c.course_code, c.course_title
     FROM teaches t
     JOIN courses c ON c.course_code = t.course_code
     WHERE t.lecturer_id = ?
     ORDER BY c.course_code`,
    [lecturerId]
  );

  return res.json(rows);
}

async function enrollStudent(req, res) {
  const { courseCode } = req.params;
  const studentId = req.user.role === 'student' ? req.user.user_id : req.body.student_id;

  if (!studentId) {
    return res.status(400).json({ message: 'student_id is required.' });
  }

  const [studentRows] = await pool.query('SELECT student_id FROM student WHERE student_id = ?', [studentId]);
  if (studentRows.length === 0) {
    return res.status(404).json({ message: 'Student not found.' });
  }

  const [courseRows] = await pool.query('SELECT course_code FROM courses WHERE course_code = ?', [courseCode]);
  if (courseRows.length === 0) {
    return res.status(404).json({ message: 'Course not found.' });
  }

  const [duplicateRows] = await pool.query(
    'SELECT student_id FROM enroll WHERE student_id = ? AND course_code = ?',
    [studentId, courseCode]
  );
  if (duplicateRows.length > 0) {
    return res.status(409).json({ message: 'Student is already enrolled in this course.' });
  }

  const [countRows] = await pool.query('SELECT COUNT(*) AS total FROM enroll WHERE student_id = ?', [studentId]);
  if (countRows[0].total >= 6) {
    return res.status(400).json({ message: 'Student cannot register for more than 6 courses.' });
  }

  await pool.query('INSERT INTO enroll (student_id, course_code, grade) VALUES (?, ?, NULL)', [studentId, courseCode]);
  return res.status(201).json({ message: 'Student registered for course successfully.' });
}

async function getCourseMembers(req, res) {
  const { courseCode } = req.params;
  const userId = req.user.user_id;
  const userRole = req.user.role;

  const [lecturerRows] = await pool.query(
    `SELECT l.lecturer_id, l.lf_name AS first_name, l.ll_name AS last_name, l.department
     FROM teaches t
     JOIN lecturer l ON l.lecturer_id = t.lecturer_id
     WHERE t.course_code = ?`,
    [courseCode]
  );

  let studentQuery = `
    SELECT s.student_id, s.sf_name AS first_name, s.sl_name AS last_name, s.major, s.department
  `;

  if (userRole !== 'student') {
    studentQuery += `, e.grade`;
  }

  studentQuery += `
    FROM enroll e
    JOIN student s ON s.student_id = e.student_id
    WHERE e.course_code = ?
    ORDER BY s.student_id
  `;

  const [studentRows] = await pool.query(studentQuery, [courseCode]);

  return res.json({
    course_code: courseCode,
    lecturer: lecturerRows[0] || null,
    students: studentRows,
  });
}

async function getStudentCourseGrades(req, res) {
  const { studentId, courseCode } = req.params;
  const [rows] = await pool.query(
    `SELECT e.student_id, e.course_code, c.course_title, e.grade AS final_grade,
    (SELECT ROUND (AVG(s.submission_grade), 2) FROM submit s 
    JOIN assignment a ON a.assign_id = s.assign_id 
    WHERE s.student_id = e.student_id AND a.course_code = e.course_code) AS assignment_average 
    FROM enroll e 
    JOIN courses c ON c.course_code = e.course_code 
    WHERE e.student_id = ? AND e.course_code = ?`,
    [studentId, courseCode]
  );
  if (rows.length === 0) {
    return res.status(404).json({ message: 'Enrollment not found' });
  }
  return res.json(rows[0])
}

async function getAllCoursesWithStats(req, res) {
  const [rows] = await pool.query(
    `SELECT c.course_code, c.course_title, c.created_by,
            CONCAT(l.lf_name, ' ', l.ll_name) AS lecturer_name,
            t.lecturer_id,
            COUNT(DISTINCT e.student_id) AS enrolled_students
     FROM courses c
     LEFT JOIN teaches t ON t.course_code = c.course_code
     LEFT JOIN lecturer l ON l.lecturer_id = t.lecturer_id
     LEFT JOIN enroll e ON e.course_code = c.course_code
     GROUP BY c.course_code, c.course_title, c.created_by, lecturer_name, t.lecturer_id
     ORDER BY c.course_code`
  );
  return res.json(rows);
}

async function getAvailableCoursesForStudent(req, res) {
  const { studentId } = req.params;

  const [rows] = await pool.query(
    `SELECT c.course_code, c.course_title,
            CONCAT(l.lf_name, ' ', l.ll_name) AS lecturer_name
     FROM courses c
     LEFT JOIN teaches t ON t.course_code = c.course_code
     LEFT JOIN lecturer l ON l.lecturer_id = t.lecturer_id
     WHERE c.course_code NOT IN (
       SELECT course_code FROM enroll WHERE student_id = ?
     )
     ORDER BY c.course_code`,
    [studentId]
  );

  return res.json(rows);
}

async function removeStudentFromCourse(req, res) {
  const { courseCode, studentId } = req.params;

  const [result] = await pool.query(
    'DELETE FROM enroll WHERE student_id = ? AND course_code = ?',
    [studentId, courseCode]
  );

  if (result.affectedRows === 0) {
    return res.status(404).json({ message: 'Enrollment not found.' });
  }

  return res.json({ message: 'Student removed from course successfully.' });
}

async function updateCourse(req, res) {
  const { courseCode } = req.params;
  const { course_title } = req.body;

  if (!course_title) {
    return res.status(400).json({ message: 'course_title is required.' });
  }

  const [result] = await pool.query(
    'UPDATE courses SET course_title = ? WHERE course_code = ?',
    [course_title, courseCode]
  );

  if (result.affectedRows === 0) {
    return res.status(404).json({ message: 'Course not found.' });
  }

  return res.json({ message: 'Course updated successfully.' });
}

async function deleteCourse(req, res) {
  const { courseCode } = req.params;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [course] = await conn.query('SELECT course_code FROM courses WHERE course_code = ?', [courseCode]);
    if (course.length === 0) {
      await conn.rollback();
      return res.status(404).json({ message: 'Course not found.' });
    }

    await conn.query('DELETE FROM enroll WHERE course_code = ?', [courseCode]);
    await conn.query('DELETE FROM teaches WHERE course_code = ?', [courseCode]);
    await conn.query('DELETE FROM calendar_events WHERE course_code = ?', [courseCode]);
    await conn.query('DELETE FROM assignment WHERE course_code = ?', [courseCode]);
    await conn.query('DELETE FROM section WHERE course_code = ?', [courseCode]);
    await conn.query('DELETE FROM discussion_forum WHERE course_code = ?', [courseCode]);
    await conn.query('DELETE FROM courses WHERE course_code = ?', [courseCode]);

    await conn.commit();
    return res.json({ message: 'Course deleted successfully.' });
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

module.exports = {
  createCourse,
  getAllCourses,
  assignLecturer,
  getStudentCourses,
  getLecturerCourses,
  enrollStudent,
  getCourseMembers,
  getStudentCourseGrades,
  getAllCoursesWithStats,
  getAvailableCoursesForStudent,
  removeStudentFromCourse,
  updateCourse,
  deleteCourse,
};
