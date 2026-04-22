const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/authMiddleware');
const controller = require('../controllers/tourPackageController');

// Specific routes before parameterized routes
router.get('/search', requireAuth, controller.search);
router.get('/destinations', requireAuth, controller.getByDestination);

// Parameterized routes
router.get('/', requireAuth, controller.list);
router.get('/:id', requireAuth, controller.get);
router.post('/', requireAuth, requireRole(['admin']), controller.create);
router.put('/:id', requireAuth, requireRole(['admin']), controller.update);
router.delete('/:id', requireAuth, requireRole(['admin']), controller.remove);

module.exports = router;

