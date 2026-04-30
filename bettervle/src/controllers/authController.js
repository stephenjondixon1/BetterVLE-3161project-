const jwt = require('jsonwebtoken');
const pool = require('../config/db');
require('dotenv').config();

function signToken(user) {
  return jwt.sign(
    {
      user_id: user.user_id,
      user_name: user.user_name,
      role: user.acc_role,
    },
    process.env.JWT_SECRET || 'super_secret_change_me',
    { expiresIn: '8h' }
  );
}

async function register(req, res) {
  const {
    user_name,
    password,
    role,
    first_name,
    last_name,
    department,
    major,
    gpa,
    admin_name,
    admin_email,
  } = req.body;

  if (!user_name || !password || !role) {
    return res.status(400).json({ message: 'user_name, password, and role are required.' });
  }

  if (!['student', 'lecturer', 'admin'].includes(role)) {
    return res.status(400).json({ message: 'role must be student, lecturer, or admin.' });
  }

  if (role === 'admin') {
    return res.status(403).json({
      message: 'Admin accounts cannot be created through registration. Contact system administrator.'
    });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [existing] = await conn.query('SELECT user_id FROM users WHERE user_name = ?', [user_name]);
    if (existing.length > 0) {
      await conn.rollback();
      return res.status(409).json({ message: 'Username already exists.' });
    }

    const [userResult] = await conn.query(
      'INSERT INTO users (user_name, password) VALUES (?, ?)',
      [user_name, password]
    );

    const userId = userResult.insertId;
    await conn.query('INSERT INTO accounts (acc_role, user_id) VALUES (?, ?)', [role, userId]);

    if (role === 'student') {
      if (!first_name || !last_name || !major || !department || gpa === undefined) {
        await conn.rollback();
        return res.status(400).json({
          message: 'Student registration requires first_name, last_name, major, department, and gpa.',
        });
      }

      await conn.query(
        `INSERT INTO student (student_id, sf_name, sl_name, major, department, gpa)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [userId, first_name, last_name, major, department, gpa]
      );

      const [courses] = await conn.query('SELECT course_code FROM courses ORDER BY RAND() LIMIT 3');
      if (courses.length > 0) {
        for (const course of courses) {
          await conn.query(
            'INSERT INTO enroll (student_id, course_code, grade) VALUES (?, ?, NULL)',
            [userId, course.course_code]
          );
        }
      }
    }

    if (role === 'lecturer') {
      if (!first_name || !last_name || !department) {
        await conn.rollback();
        return res.status(400).json({
          message: 'Lecturer registration requires first_name, last_name, and department.',
        });
      }

      await conn.query(
        `INSERT INTO lecturer (lecturer_id, lf_name, ll_name, department)
         VALUES (?, ?, ?, ?)`,
        [userId, first_name, last_name, department]
      );
    }

    if (role === 'admin') {
      if (!admin_name || !admin_email) {
        await conn.rollback();
        return res.status(400).json({
          message: 'Admin registration requires admin_name and admin_email.',
        });
      }

      await conn.query(
        `INSERT INTO admin (admin_id, admin_name, admin_email)
         VALUES (?, ?, ?)`,
        [userId, admin_name, admin_email]
      );
    }

    await conn.commit();

    return res.status(201).json({
      message: 'User registered successfully.',
      user_id: userId,
      role,
    });
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

async function login(req, res) {
  const { user_name, password } = req.body;

  if (!user_name || !password) {
    return res.status(400).json({ message: 'user_name and password are required.' });
  }

  const [rows] = await pool.query(
    `SELECT u.user_id, u.user_name, u.password, a.acc_role
     FROM users u
     JOIN accounts a ON a.user_id = u.user_id
     WHERE u.user_name = ?`,
    [user_name]
  );

  if (rows.length === 0 || rows[0].password !== password) {
    return res.status(401).json({ message: 'Invalid credentials.' });
  }

  const token = signToken(rows[0]);

  return res.json({
    message: 'Login successful.',
    token,
    user: {
      user_id: rows[0].user_id,
      user_name: rows[0].user_name,
      role: rows[0].acc_role,
    },
  });
}

module.exports = { register, login };