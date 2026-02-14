const jwt = require('jsonwebtoken');

exports.requireAuth = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'no token' });
  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = payload;
    next();
  } catch (err) {
    res.status(401).json({ error: 'invalid token' });
  }
};

exports.requireRole = (roles = []) => (req, res, next) => {
  const role = req.user && req.user.role;
  if (!role || !roles.includes(role)) return res.status(403).json({ error: 'forbidden' });
  next();
};
