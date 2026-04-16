const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const friendController = require('../controllers/friendController');

router.use(authMiddleware);

router.get('/', friendController.getFriends);

module.exports = router;
