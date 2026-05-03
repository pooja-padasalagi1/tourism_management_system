const pool = require('../db');

exports.list = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM reviews ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.get = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM reviews WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Review not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  const { author, category, rating, comment, helpful } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO reviews (author, category, rating, comment, helpful) VALUES (?, ?, ?, ?, ?)',
      [author || 'Anonymous', category || 'hotel', rating || 0, comment || '', helpful || 0]
    );
    const [rows] = await pool.query('SELECT * FROM reviews WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  const { author, category, rating, comment, helpful } = req.body;
  try {
    await pool.query(
      'UPDATE reviews SET author = ?, category = ?, rating = ?, comment = ?, helpful = ? WHERE id = ?',
      [author || 'Anonymous', category || 'hotel', rating || 0, comment || '', helpful || 0, req.params.id]
    );
    const [rows] = await pool.query('SELECT * FROM reviews WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Review not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM reviews WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Review not found' });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};