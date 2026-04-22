const pool = require('../db');

exports.list = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM tour_packages ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.get = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM tour_packages WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Tour package not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  const { name, description, duration_days, price, destination, included_activities, max_participants, difficulty_level, rating } = req.body;
  try {
    if (!name) return res.status(400).json({ error: 'Package name is required' });
    
    const [result] = await pool.query(
      'INSERT INTO tour_packages (name, description, duration_days, price, destination, included_activities, max_participants, difficulty_level, rating) VALUES (?,?,?,?,?,?,?,?,?)',
      [name, description || '', duration_days || 0, price || 0, destination || '', included_activities || '', max_participants || 0, difficulty_level || 'moderate', rating || 0]
    );
    
    const id = result.insertId;
    const [rows] = await pool.query('SELECT * FROM tour_packages WHERE id = ?', [id]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  const id = req.params.id;
  const { name, description, duration_days, price, destination, included_activities, max_participants, difficulty_level, rating } = req.body;
  try {
    if (!name) return res.status(400).json({ error: 'Package name is required' });
    
    await pool.query(
      'UPDATE tour_packages SET name = ?, description = ?, duration_days = ?, price = ?, destination = ?, included_activities = ?, max_participants = ?, difficulty_level = ?, rating = ? WHERE id = ?',
      [name, description || '', duration_days || 0, price || 0, destination || '', included_activities || '', max_participants || 0, difficulty_level || 'moderate', rating || 0, id]
    );
    
    const [rows] = await pool.query('SELECT * FROM tour_packages WHERE id = ?', [id]);
    if (!rows.length) return res.status(404).json({ error: 'Tour package not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM tour_packages WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Tour package not found' });
    res.json({ success: true, message: 'Tour package deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.search = async (req, res) => {
  const { destination, difficulty, maxPrice } = req.query;
  try {
    let query = 'SELECT * FROM tour_packages WHERE 1=1';
    let params = [];

    if (destination) {
      query += ' AND destination LIKE ?';
      params.push(`%${destination}%`);
    }
    if (difficulty) {
      query += ' AND difficulty_level = ?';
      params.push(difficulty);
    }
    if (maxPrice) {
      query += ' AND price <= ?';
      params.push(maxPrice);
    }

    query += ' ORDER BY rating DESC, created_at DESC';
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getByDestination = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT DISTINCT destination FROM tour_packages WHERE destination IS NOT NULL AND destination != ""');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
