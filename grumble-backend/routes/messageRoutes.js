const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const chatMessageController = require('../controllers/chatMessageController');

router.use(authMiddleware);

router.delete('/:messageId', chatMessageController.deleteMessage);

module.exports = router;
