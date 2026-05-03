const pool = require('../db');

exports.list = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM tour_guides ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.get = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM tour_guides WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Guide not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  const { name, phone, bio, languages, rating, tours, available } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO tour_guides (name, phone, bio, languages, rating, tours, available) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name || '', phone || '', bio || '', languages || '', rating || 0, tours || 0, available === false ? 0 : 1]
    );
    const [rows] = await pool.query('SELECT * FROM tour_guides WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  const { name, phone, bio, languages, rating, tours, available } = req.body;
  try {
    await pool.query(
      'UPDATE tour_guides SET name = ?, phone = ?, bio = ?, languages = ?, rating = ?, tours = ?, available = ? WHERE id = ?',
      [name || '', phone || '', bio || '', languages || '', rating || 0, tours || 0, available === false ? 0 : 1, req.params.id]
    );
    const [rows] = await pool.query('SELECT * FROM tour_guides WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Guide not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM tour_guides WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Guide not found' });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};