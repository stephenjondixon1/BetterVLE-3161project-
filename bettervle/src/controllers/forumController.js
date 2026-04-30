const pool = require('../config/db');

async function getCourseForums(req, res) {
  const { courseCode } = req.params;
  const [rows] = await pool.query(
    `SELECT df.forum_id, df.course_code, df.created_by, u.user_name
     FROM discussion_forum df
     JOIN users u ON u.user_id = df.created_by
     WHERE df.course_code = ?
     ORDER BY df.forum_id`,
    [courseCode]
  );
  return res.json(rows);
}

async function createForum(req, res) {
  const { courseCode } = req.params;
  const [result] = await pool.query(
    'INSERT INTO discussion_forum (created_by, course_code) VALUES (?, ?)',
    [req.user.user_id, courseCode]
  );
  return res.status(201).json({ message: 'Forum created successfully.', forum_id: result.insertId });
}

async function getThreads(req, res) {
  const { forumId } = req.params;
  const [rows] = await pool.query(
    `SELECT dt.thread_id, dt.forum_id, dt.title, dt.starter_post, dt.created_by, u.user_name, dt.created_at
     FROM discussion_thread dt
     JOIN users u ON u.user_id = dt.created_by
     WHERE dt.forum_id = ?
     ORDER BY dt.created_at DESC, dt.thread_id DESC`,
    [forumId]
  );
  return res.json(rows);
}

async function createThread(req, res) {
  const { forumId } = req.params;
  const { title, starter_post } = req.body;

  if (!title || !starter_post) {
    return res.status(400).json({ message: 'title and starter_post are required.' });
  }

  const [result] = await pool.query(
    `INSERT INTO discussion_thread (forum_id, title, starter_post, created_by)
     VALUES (?, ?, ?, ?)`,
    [forumId, title, starter_post, req.user.user_id]
  );

  return res.status(201).json({ message: 'Thread created successfully.', thread_id: result.insertId });
}

async function addReply(req, res) {
  const { threadId } = req.params;
  const { content, parent_reply_id } = req.body;

  if (!content) {
    return res.status(400).json({ message: 'content is required.' });
  }

  const [result] = await pool.query(
    `INSERT INTO replies (thread_id, parent_reply_id, content, created_by)
     VALUES (?, ?, ?, ?)`,
    [threadId, parent_reply_id || null, content, req.user.user_id]
  );

  return res.status(201).json({ message: 'Reply added successfully.', reply_id: result.insertId });
}

async function getReplies(req, res) {
  const { threadId } = req.params;
  const [rows] = await pool.query(
    `SELECT r.reply_id, r.thread_id, r.parent_reply_id, r.content, r.created_by, u.user_name, r.created_at
     FROM replies r
     JOIN users u ON u.user_id = r.created_by
     WHERE r.thread_id = ?
     ORDER BY r.created_at ASC, r.reply_id ASC`,
    [threadId]
  );
  return res.json(rows);
}

module.exports = {
  getCourseForums,
  createForum,
  getThreads,
  createThread,
  addReply,
  getReplies,
};
