const pool = require('../db');

function parseVehicles(value) {
  try {
    return value ? JSON.parse(value) : [];
  } catch {
    return [];
  }
}

exports.list = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM transfers ORDER BY created_at DESC');
    res.json(rows.map((item) => ({ ...item, vehicles: parseVehicles(item.vehicles) })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.get = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM transfers WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Transfer not found' });
    const item = rows[0];
    res.json({ ...item, vehicles: parseVehicles(item.vehicles) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  const { provider, pickup, dropoff, type, price, vehicles } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO transfers (provider, pickup, dropoff, type, price, vehicles) VALUES (?, ?, ?, ?, ?, ?)',
      [provider || '', pickup || '', dropoff || '', type || '', price || 0, JSON.stringify(vehicles || [])]
    );
    const [rows] = await pool.query('SELECT * FROM transfers WHERE id = ?', [result.insertId]);
    const item = rows[0];
    res.status(201).json({ ...item, vehicles: parseVehicles(item.vehicles) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  const { provider, pickup, dropoff, type, price, vehicles } = req.body;
  try {
    await pool.query(
      'UPDATE transfers SET provider = ?, pickup = ?, dropoff = ?, type = ?, price = ?, vehicles = ? WHERE id = ?',
      [provider || '', pickup || '', dropoff || '', type || '', price || 0, JSON.stringify(vehicles || []), req.params.id]
    );
    const [rows] = await pool.query('SELECT * FROM transfers WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Transfer not found' });
    const item = rows[0];
    res.json({ ...item, vehicles: parseVehicles(item.vehicles) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM transfers WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Transfer not found' });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};