const pool = require('../config/db');

async function createAssignment(req, res) {
  const { courseCode } = req.params;
  const { weight } = req.body;

  if (weight === undefined) {
    return res.status(400).json({ message: 'weight is required.' });
  }

  const [result] = await pool.query(
    'INSERT INTO assignment (weight, course_code) VALUES (?, ?)',
    [weight, courseCode]
  );

  return res.status(201).json({ message: 'Assignment created successfully.', assign_id: result.insertId });
}

async function submitAssignment(req, res) {
  const { assignmentId } = req.params;
  const studentId = req.user.role === 'student' ? req.user.user_id : req.body.student_id;
  const { submission_content } = req.body;

  if (!studentId || !submission_content) {
    return res.status(400).json({ message: 'student_id and submission_content are required.' });
  }

  const [assignRows] = await pool.query('SELECT assign_id FROM assignment WHERE assign_id = ?', [assignmentId]);
  if (assignRows.length === 0) {
    return res.status(404).json({ message: 'Assignment not found.' });
  }

  await pool.query(
    `INSERT INTO submits (student_id, assign_id, submission_content)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE submission_content = VALUES(submission_content), submission_date = CURRENT_TIMESTAMP`,
    [studentId, assignmentId, submission_content]
  );

  return res.status(201).json({ message: 'Assignment submitted successfully.' });
}

async function gradeSubmission(req, res) {
  const { assignmentId, studentId } = req.params;
  const { submission_grade } = req.body;

  if (submission_grade === undefined) {
    return res.status(400).json({ message: 'submission_grade is required.' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [existingSubmission] = await conn.query(
      'SELECT * FROM submits WHERE assign_id = ? AND student_id = ?',
      [assignmentId, studentId]
    );

    if (existingSubmission.length === 0) {
      await conn.query(
        'INSERT INTO submits (student_id, assign_id, submission_grade, submission_date) VALUES (?, ?, ?, NOW())',
        [studentId, assignmentId, submission_grade]
      );
    } else {
      await conn.query(
        'UPDATE submits SET submission_grade = ? WHERE assign_id = ? AND student_id = ?',
        [submission_grade, assignmentId, studentId]
      );
    }

    const [assignmentRows] = await conn.query(
      'SELECT course_code, weight FROM assignment WHERE assign_id = ?',
      [assignmentId]
    );

    if (assignmentRows.length === 0) {
      await conn.rollback();
      return res.status(404).json({ message: 'Assignment not found.' });
    }

    const courseCode = assignmentRows[0].course_code;

    const [submissions] = await conn.query(
      `SELECT s.submission_grade, a.weight
       FROM submits s
       JOIN assignment a ON a.assign_id = s.assign_id
       WHERE s.student_id = ? AND a.course_code = ? AND s.submission_grade IS NOT NULL`,
      [studentId, courseCode]
    );

    let finalGrade = null;

    if (submissions.length > 0) {
      let totalWeight = 0;
      let weightedSum = 0;

      for (const sub of submissions) {
        weightedSum += parseFloat(sub.submission_grade) * parseFloat(sub.weight);
        totalWeight += parseFloat(sub.weight);
      }

      finalGrade = totalWeight > 0 ? (weightedSum / totalWeight).toFixed(2) : null;

      await conn.query(
        'UPDATE enroll SET grade = ? WHERE student_id = ? AND course_code = ?',
        [finalGrade, studentId, courseCode]
      );
    }

    await conn.commit();
    return res.json({
      message: 'Submission graded and final average updated successfully.',
      final_grade: finalGrade
    });

  } catch (error) {
    await conn.rollback();
    console.error('Grade submission error:', error);
    return res.status(500).json({ message: 'Failed to grade submission', error: error.message });
  } finally {
    conn.release();
  }
}

async function getStudentAssignmentSubmissions(req, res) {
  const { studentId } = req.params;
  const [rows] = await pool.query(
    `SELECT a.assign_id, a.course_code, a.weight, s.submission_date, s.submission_content, s.submission_grade
     FROM submits s
     JOIN assignment a ON a.assign_id = s.assign_id
     WHERE s.student_id = ?
     ORDER BY a.course_code, a.assign_id`,
    [studentId]
  );

  return res.json(rows);
}

async function getAssignmentDetails(req, res) {
  const { assignmentId } = req.params;

  const [rows] = await pool.query(
    `SELECT a.assign_id, a.weight, a.course_code, c.course_title
     FROM assignment a
     JOIN courses c ON c.course_code = a.course_code
     WHERE a.assign_id = ?`,
    [assignmentId]
  );

  if (rows.length === 0) {
    return res.status(404).json({ message: 'Assignment not found.' });
  }

  return res.json(rows[0]);
}

async function getStudentSubmission(req, res) {
  const { assignmentId, studentId } = req.params;

  const [rows] = await pool.query(
    `SELECT * FROM submits 
     WHERE assign_id = ? AND student_id = ?`,
    [assignmentId, studentId]
  );

  if (rows.length === 0) {
    return res.status(404).json({ message: 'Submission not found.' });
  }

  return res.json(rows[0]);
}

async function updateAssignment(req, res) {
  const { assignmentId } = req.params;
  const { weight } = req.body;

  if (weight === undefined) {
    return res.status(400).json({ message: 'weight is required.' });
  }

  const [result] = await pool.query(
    'UPDATE assignment SET weight = ? WHERE assign_id = ?',
    [weight, assignmentId]
  );

  if (result.affectedRows === 0) {
    return res.status(404).json({ message: 'Assignment not found.' });
  }

  return res.json({ message: 'Assignment updated successfully.' });
}

async function deleteAssignment(req, res) {
  const { assignmentId } = req.params;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    await conn.query('DELETE FROM submits WHERE assign_id = ?', [assignmentId]);

    const [result] = await conn.query('DELETE FROM assignment WHERE assign_id = ?', [assignmentId]);

    if (result.affectedRows === 0) {
      await conn.rollback();
      return res.status(404).json({ message: 'Assignment not found.' });
    }

    await conn.commit();
    return res.json({ message: 'Assignment deleted successfully.' });
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

module.exports = {
  createAssignment,
  submitAssignment,
  gradeSubmission,
  getStudentAssignmentSubmissions,
  getAssignmentDetails,
  getStudentSubmission,
  updateAssignment,
  deleteAssignment
};
