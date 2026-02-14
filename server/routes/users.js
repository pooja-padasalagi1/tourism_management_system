const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/authMiddleware');
const { listUsers, getUser, createUser, updateUser, deleteUser } = require('../controllers/userController');

router.get('/', requireAuth, requireRole(['admin']), listUsers);
router.get('/:id', requireAuth, getUser);
router.post('/', requireAuth, requireRole(['admin']), createUser);
router.put('/:id', requireAuth, requireRole(['admin']), updateUser);
router.delete('/:id', requireAuth, requireRole(['admin']), deleteUser);

module.exports = router;
