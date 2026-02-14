const pool = require('../db');

exports.list = async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT b.*, u.name as user_name, t.title as tour_title, h.name as hotel_name
      FROM bookings b
      LEFT JOIN users u ON u.id = b.user_id
      LEFT JOIN tours t ON t.id = b.tour_id
      LEFT JOIN hotels h ON h.id = b.hotel_id`);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.get = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM bookings WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  const { user_id, tour_id, hotel_id, status } = req.body;
  try {
    const [result] = await pool.query('INSERT INTO bookings (user_id,tour_id,hotel_id,status) VALUES (?,?,?,?)', [user_id||null, tour_id||null, hotel_id||null, status||'pending']);
    const id = result.insertId;
    const [rows] = await pool.query('SELECT * FROM bookings WHERE id = ?', [id]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  const id = req.params.id;
  const { user_id, tour_id, hotel_id, status } = req.body;
  try {
    await pool.query('UPDATE bookings SET user_id = ?, tour_id = ?, hotel_id = ?, status = ? WHERE id = ?', [user_id, tour_id, hotel_id, status, id]);
    const [rows] = await pool.query('SELECT * FROM bookings WHERE id = ?', [id]);
    if (!rows.length) return res.status(404).json({ error: 'not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM bookings WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'not found' });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
