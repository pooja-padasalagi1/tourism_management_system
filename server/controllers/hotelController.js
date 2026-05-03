const pool = require('../db');

exports.list = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM hotels');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.get = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM hotels WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  const { name, location, rating, description, amenities, price_range } = req.body;
  try {
    const [result] = await pool.query('INSERT INTO hotels (name,location,rating,description,amenities,price_range) VALUES (?,?,?,?,?,?)', [name, location, rating||0, description, amenities, price_range]);
    const id = result.insertId;
    const [rows] = await pool.query('SELECT * FROM hotels WHERE id = ?', [id]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  const id = req.params.id;
  const { name, location, rating, description, amenities, price_range } = req.body;
  try {
    await pool.query('UPDATE hotels SET name = ?, location = ?, rating = ?, description = ?, amenities = ?, price_range = ? WHERE id = ?', [name, location, rating, description, amenities, price_range, id]);
    const [rows] = await pool.query('SELECT * FROM hotels WHERE id = ?', [id]);
    if (!rows.length) return res.status(404).json({ error: 'not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM hotels WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'not found' });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
