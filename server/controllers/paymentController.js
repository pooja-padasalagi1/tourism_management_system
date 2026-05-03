const pool = require('../db');

exports.list = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.*, b.hotel_id, h.name as hotel_name, t.title as tour_title
      FROM payments p
      LEFT JOIN bookings b ON b.id = p.booking_id
      LEFT JOIN hotels h ON h.id = b.hotel_id
      LEFT JOIN tours t ON t.id = b.tour_id
      ORDER BY p.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.get = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM payments WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Payment not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  const { booking_id, user_name, amount, method, status, transaction_id } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO payments (booking_id, user_name, amount, method, status, transaction_id) VALUES (?, ?, ?, ?, ?, ?)',
      [booking_id || null, user_name || '', amount || 0, method || '', status || 'pending', transaction_id || '']
    );
    const [rows] = await pool.query('SELECT * FROM payments WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  const { booking_id, user_name, amount, method, status, transaction_id } = req.body;
  try {
    await pool.query(
      'UPDATE payments SET booking_id = ?, user_name = ?, amount = ?, method = ?, status = ?, transaction_id = ? WHERE id = ?',
      [booking_id || null, user_name || '', amount || 0, method || '', status || 'pending', transaction_id || '', req.params.id]
    );
    const [rows] = await pool.query('SELECT * FROM payments WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Payment not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM payments WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Payment not found' });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};