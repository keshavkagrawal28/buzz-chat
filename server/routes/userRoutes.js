const express = require('express');
const {
  registerUser,
  loginUser,
  getAllUsers,
} = require('../controllers/userController');
const { authorise } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/').post(registerUser);
router.route('/').get(authorise, getAllUsers);
router.route('/login').post(loginUser);

module.exports = router;
