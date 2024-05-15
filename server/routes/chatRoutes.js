const express = require('express');
const {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  addUserToGroup,
  removeUserFromGroup,
} = require('../controllers/chatController');
const { authorise } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/').post(authorise, accessChat);
router.route('/').get(authorise, fetchChats);
router.route('/group').post(authorise, createGroupChat);
router.route('/group/rename').put(authorise, renameGroup);
router.route('/group/addUser').put(authorise, addUserToGroup);
router.route('/group/removeUser').put(authorise, removeUserFromGroup);

module.exports = router;
