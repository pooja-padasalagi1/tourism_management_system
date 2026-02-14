const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/authMiddleware');
const controller = require('../controllers/bookingController');

router.get('/', requireAuth, requireRole(['admin']), controller.list);
router.get('/:id', requireAuth, controller.get);
// allow users to create their own booking; admin can also create
router.post('/', requireAuth, controller.create);
router.put('/:id', requireAuth, requireRole(['admin']), controller.update);
router.delete('/:id', requireAuth, requireRole(['admin']), controller.remove);

module.exports = router;
