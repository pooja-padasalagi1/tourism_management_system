const pool = require('../db');

exports.list = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM tours');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.get = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM tours WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  const { title, description, price, duration_days, difficulty, max_participants } = req.body;
  try {
    const [result] = await pool.query('INSERT INTO tours (title,description,price,duration_days,difficulty,max_participants) VALUES (?,?,?,?,?,?)', [title, description, price||0, duration_days||1, difficulty||'Easy', max_participants||10]);
    const id = result.insertId;
    const [rows] = await pool.query('SELECT * FROM tours WHERE id = ?', [id]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  const id = req.params.id;
  const { title, description, price, duration_days, difficulty, max_participants } = req.body;
  try {
    await pool.query('UPDATE tours SET title = ?, description = ?, price = ?, duration_days = ?, difficulty = ?, max_participants = ? WHERE id = ?', [title, description, price, duration_days, difficulty, max_participants, id]);
    const [rows] = await pool.query('SELECT * FROM tours WHERE id = ?', [id]);
    if (!rows.length) return res.status(404).json({ error: 'not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM tours WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'not found' });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
