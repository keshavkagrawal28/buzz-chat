const asyncHandler = require('express-async-handler');
const Chat = require('../models/chatModel');
const User = require('../models/userModel');
const Message = require('../models/messageModel');

const sendMessage = asyncHandler(async (req, res) => {
  const { content, chatId } = req.body;
  if (!content || !chatId) {
    console.error('Invalid data in message request');
    return res.sendStatus(400);
  }

  let newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
  };

  try {
    let message = await Message.create(newMessage);
    message = await message.populate('sender', 'name profilePic');
    message = await message.populate('chat');
    message = await User.populate(message, {
      path: 'chat.users',
      select: 'name profilePic email',
    });

    await Chat.findByIdAndUpdate(req.body.chatId, {
      latestMessage: message,
    });

    res.json(message);
  } catch (err) {
    res.status(400);
    throw new Error(err.message);
  }
});

const getAllMessages = asyncHandler(async (req, res) => {
  try {
    await Message.updateMany(
      {
        chat: req.params.chatId,
        sender: { $ne: req.user._id },
      },
      {
        $addToSet: { readBy: req.user._id },
      }
    );

    const messages = await Message.find({ chat: req.params.chatId })
      .populate('sender', 'name profilePic email')
      .populate('chat');
    res.json(messages);
  } catch (err) {
    res.status(400);
    throw new Error(err.message);
  }
});

const markMessageAsRead = asyncHandler(async (req, res) => {
  try {
    await Message.findByIdAndUpdate(req.body.messageId, {
      $addToSet: { readBy: req.user._id },
    });
    res.json();
  } catch (err) {
    res.status(400);
    throw new Error(err.message);
  }
});

module.exports = { sendMessage, getAllMessages, markMessageAsRead };
