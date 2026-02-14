const pool = require('../db');

exports.listUsers = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id,name,email,role FROM users');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUser = async (req, res) => {
  const id = req.params.id;
  try {
    const [rows] = await pool.query('SELECT id,name,email,role FROM users WHERE id = ?', [id]);
    if (!rows.length) return res.status(404).json({ error: 'not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createUser = async (req, res) => {
  const { name, email, role, password } = req.body;
  try {
    const [exists] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (exists.length) return res.status(400).json({ error: 'user exists' });
    const hash = password ? require('bcryptjs').hashSync(password, 10) : null;
    const [result] = await pool.query('INSERT INTO users (name,email,password,role) VALUES (?,?,?,?)', [name||'', email, hash, role||'user']);
    const id = result.insertId;
    const [rows] = await pool.query('SELECT id,name,email,role FROM users WHERE id = ?', [id]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateUser = async (req, res) => {
  const id = req.params.id;
  const { name, email, role, password } = req.body;
  try {
    const hash = password ? require('bcryptjs').hashSync(password, 10) : undefined;
    if (hash !== undefined) {
      await pool.query('UPDATE users SET name = ?, email = ?, role = ?, password = ? WHERE id = ?', [name, email, role, hash, id]);
    } else {
      await pool.query('UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?', [name, email, role, id]);
    }
    const [rows] = await pool.query('SELECT id,name,email,role FROM users WHERE id = ?', [id]);
    if (!rows.length) return res.status(404).json({ error: 'not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'not found' });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
