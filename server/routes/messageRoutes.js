const express = require('express');
const { authorise } = require('../middleware/authMiddleware');
const {
  sendMessage,
  getAllMessages,
  markMessageAsRead,
} = require('../controllers/messageController');

const router = express.Router();

router.route('/').post(authorise, sendMessage);
router.route('/:chatId').get(authorise, getAllMessages);
router.route('/markAsRead').post(authorise, markMessageAsRead);

module.exports = router;
