const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/authMiddleware');
const controller = require('../controllers/enquiryController');

router.get('/', requireAuth, controller.list);
router.get('/:id', requireAuth, controller.get);
router.post('/', requireAuth, controller.create);
router.put('/:id', requireAuth, controller.update);
router.delete('/:id', requireAuth, controller.remove);

module.exports = router;
