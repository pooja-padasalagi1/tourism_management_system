const pool = require('../db');

exports.list = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM enquiries ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.get = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM enquiries WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Enquiry not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  const { name, email, subject, message, status } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO enquiries (name, email, subject, message, status) VALUES (?, ?, ?, ?, ?)',
      [name || '', email || '', subject || '', message || '', status || 'new']
    );
    const [rows] = await pool.query('SELECT * FROM enquiries WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  const { name, email, subject, message, status } = req.body;
  try {
    await pool.query(
      'UPDATE enquiries SET name = ?, email = ?, subject = ?, message = ?, status = ? WHERE id = ?',
      [name || '', email || '', subject || '', message || '', status || 'new', req.params.id]
    );
    const [rows] = await pool.query('SELECT * FROM enquiries WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Enquiry not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM enquiries WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Enquiry not found' });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};