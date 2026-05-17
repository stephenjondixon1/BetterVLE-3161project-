const pool = require('../config/db');

async function runView(req, res, viewName) {
  const [rows] = await pool.query(`SELECT * FROM ${viewName}`);
  return res.json(rows);
}

module.exports = {
  getCourses50Plus: (req, res) => runView(req, res, 'courses_50_plus'),
  getStudents5Plus: (req, res) => runView(req, res, 'students_5_plus'),
  getLecturers3Plus: (req, res) => runView(req, res, 'lecturers_3_plus'),
  getTop10Courses: (req, res) => runView(req, res, 'top_10_courses'),
  getTop10Students: (req, res) => runView(req, res, 'top_10_students'),
};
