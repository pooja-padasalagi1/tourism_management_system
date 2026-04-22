const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'missing fields' });
  try {
    const [exists] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (exists.length) return res.status(400).json({ error: 'user exists' });
    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query('INSERT INTO users (name,email,password,role) VALUES (?,?,?,?)', [name||'', email, hash, role||'user']);
    const id = result.insertId;
    const token = jwt.sign({ id, email, role: role||'user' }, process.env.JWT_SECRET || 'secret', { expiresIn: '8h' });
    res.json({ token, user: { id, name, email, role } });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Database connection failed. Please ensure MySQL is running and configured correctly.' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'missing fields' });
  try {
    const [rows] = await pool.query('SELECT id,name,email,password,role FROM users WHERE email = ?', [email]);
    const user = rows[0];
    if (!user) return res.status(401).json({ error: 'invalid credentials' });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: 'invalid credentials' });
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '8h' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Database connection failed. Please ensure MySQL is running and configured correctly.' });
  }
};

