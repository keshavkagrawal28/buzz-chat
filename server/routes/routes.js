const express = require('express');
const userRoutes = require('./userRoutes');
const chatRoutes = require('./chatRoutes');
const messageRoutes = require('./messageRoutes');
const { notFound, errorHandler } = require('../middleware/errorMiddleware');

const router = express.Router();

router.use('/user', userRoutes);
router.use('/chat', chatRoutes);
router.use('/message', messageRoutes);

router.use(notFound);
router.use(errorHandler);

module.exports = router;
