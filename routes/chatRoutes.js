const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { validateMessage, messageRateLimit } = require('../middleware/chatMiddleware');
const chatUpload = require('../utils/chatUploadMiddleware');
const {
  accessChat,
  getUserChats,
  sendMessage,
  getMessages,
  markMessagesAsRead,
  getOnlineUsers,
  searchMessages,
  deleteMessage,
  blockUser,
  unblockUser,
  sendFileMessage
} = require('../controllers/chatController');

// Access or create a chat
router.post('/access', protect, accessChat);

// Get all user's chats (with unread counts)
router.get('/', protect, getUserChats);

// Send message (with validation and rate limiting)
router.post('/:chatId/message', protect, messageRateLimit, validateMessage, sendMessage);

// Send file/image message
router.post('/:chatId/file', protect, messageRateLimit, chatUpload.single('file'), sendFileMessage);

// Get messages (with pagination)
router.get('/:chatId/messages', protect, getMessages);

// Search messages in a chat
router.get('/:chatId/search', protect, searchMessages);

// Mark messages as read
router.put('/:chatId/read', protect, markMessagesAsRead);

// Delete a message
router.delete('/message/:messageId', protect, deleteMessage);

// Block/unblock users
router.post('/block', protect, blockUser);
router.post('/unblock', protect, unblockUser);

// Get online users
router.get('/online-users', protect, getOnlineUsers);

module.exports = router;