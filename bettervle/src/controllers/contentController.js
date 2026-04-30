const pool = require('../config/db');

async function createSection(req, res) {
  const { courseCode } = req.params;
  const { section_num } = req.body;

  if (section_num === undefined) {
    return res.status(400).json({ message: 'section_num is required.' });
  }

  const [result] = await pool.query(
    'INSERT INTO section (section_num, course_code) VALUES (?, ?)',
    [section_num, courseCode]
  );

  return res.status(201).json({ message: 'Section created successfully.', section_id: result.insertId });
}

async function addLink(req, res) {
  const { sectionId } = req.params;
  const { item_name, link_name, url } = req.body;

  if (!item_name || !link_name || !url) {
    return res.status(400).json({ message: 'item_name, link_name, and url are required.' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [item] = await conn.query('INSERT INTO section_item (item_name, section_id) VALUES (?, ?)', [item_name, sectionId]);
    await conn.query('INSERT INTO link (link_id, link_name, url) VALUES (?, ?, ?)', [item.insertId, link_name, url]);
    await conn.commit();
    return res.status(201).json({ message: 'Link added successfully.', item_id: item.insertId });
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

async function addSlide(req, res) {
  const { sectionId } = req.params;
  const { item_name, slideset_name, slide_url } = req.body;

  if (!item_name || !slideset_name || !slide_url) {
    return res.status(400).json({ message: 'item_name, slideset_name, and slide_url are required.' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [item] = await conn.query('INSERT INTO section_item (item_name, section_id) VALUES (?, ?)', [item_name, sectionId]);
    await conn.query(
      'INSERT INTO lecture_slide (slide_num, slideset_name, slide_url) VALUES (?, ?, ?)',
      [item.insertId, slideset_name, slide_url]
    );
    await conn.commit();
    return res.status(201).json({ message: 'Slide resource added successfully.', item_id: item.insertId });
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

async function addFile(req, res) {
  const { sectionId } = req.params;
  const { item_name, file_name, file_url } = req.body;

  if (!item_name || !file_name || !file_url) {
    return res.status(400).json({ message: 'item_name, file_name, and file_url are required.' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [item] = await conn.query('INSERT INTO section_item (item_name, section_id) VALUES (?, ?)', [item_name, sectionId]);
    await conn.query(
      'INSERT INTO file_resource (file_id, file_name, file_url) VALUES (?, ?, ?)',
      [item.insertId, file_name, file_url]
    );
    await conn.commit();
    return res.status(201).json({ message: 'File resource added successfully.', item_id: item.insertId });
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

async function getCourseContent(req, res) {
  const { courseCode } = req.params;

  const [sections] = await pool.query(
    `SELECT section_id, section_num, course_code
     FROM section
     WHERE course_code = ?
     ORDER BY section_num, section_id`,
    [courseCode]
  );

  const [links] = await pool.query(
    `SELECT s.section_id, s.section_num, si.item_id, si.item_name, l.link_name, l.url
     FROM section s
     JOIN section_item si ON si.section_id = s.section_id
     JOIN link l ON l.link_id = si.item_id
     WHERE s.course_code = ?
     ORDER BY s.section_num, si.item_id`,
    [courseCode]
  );

  const [slides] = await pool.query(
    `SELECT s.section_id, s.section_num, si.item_id, si.item_name, ls.slideset_name, ls.slide_url
     FROM section s
     JOIN section_item si ON si.section_id = s.section_id
     JOIN lecture_slide ls ON ls.slide_num = si.item_id
     WHERE s.course_code = ?
     ORDER BY s.section_num, si.item_id`,
    [courseCode]
  );

  const [files] = await pool.query(
    `SELECT s.section_id, s.section_num, si.item_id, si.item_name, fr.file_name, fr.file_url
     FROM section s
     JOIN section_item si ON si.section_id = s.section_id
     JOIN file_resource fr ON fr.file_id = si.item_id
     WHERE s.course_code = ?
     ORDER BY s.section_num, si.item_id`,
    [courseCode]
  );

  return res.json({ sections, links, slides, files });
}

module.exports = { createSection, addLink, addSlide, addFile, getCourseContent };
