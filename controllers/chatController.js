const Chat = require('../models/Chat');
const Message = require('../models/Message');

// Start or get chat between two users
exports.accessChat = async (req, res) => {
  const { userId } = req.body;

  try {
    let chat = await Chat.findOne({ 
      members: { $all: [req.user.id, userId] } 
    })
    .populate('members', 'name avatar')
    .populate({
      path: 'lastMessage',
      populate: { path: 'sender', select: 'name avatar' }
    });

    if (!chat) {
      chat = await Chat.create({ members: [req.user.id, userId] });
      // Populate the newly created chat
      chat = await Chat.findById(chat._id)
        .populate('members', 'name avatar');
    }

    res.json(chat);
  } catch (err) {
    console.error('Access chat error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all chats of the current user with unread count
exports.getUserChats = async (req, res) => {
  try {
    const chats = await Chat.find({ members: req.user.id })
      .populate('members', 'name avatar')
      .populate({
        path: 'lastMessage',
        populate: { path: 'sender', select: 'name avatar' }
      })
      .sort({ updatedAt: -1 });

    // Add unread count for each chat
    const chatsWithUnread = await Promise.all(
      chats.map(async (chat) => {
        const unreadCount = await Message.countDocuments({
          chat: chat._id,
          sender: { $ne: req.user.id }, // Not sent by current user
          readBy: { $ne: req.user.id } // Not read by current user
        });

        return {
          ...chat.toObject(),
          unreadCount
        };
      })
    );

    res.json(chatsWithUnread);
  } catch (err) {
    console.error('Get user chats error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Send a message to a chat
exports.sendMessage = async (req, res) => {
  const { text } = req.body;
  const { chatId } = req.params;

  try {
    // Verify user is member of this chat
    const chat = await Chat.findById(chatId);
    if (!chat || !chat.members.includes(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const message = await Message.create({
      chat: chatId,
      sender: req.user.id,
      text,
      readBy: [req.user.id] // Sender automatically reads their message
    });

    // Populate sender info
    await message.populate('sender', 'name avatar');

    // Update lastMessage in Chat and updatedAt
    await Chat.findByIdAndUpdate(chatId, { 
      lastMessage: message._id,
      updatedAt: new Date()
    });

    res.status(201).json(message);
  } catch (err) {
    console.error('Send message error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all messages in a chat with pagination
exports.getMessages = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;

    // Verify user is member of this chat
    const chat = await Chat.findById(req.params.chatId);
    if (!chat || !chat.members.includes(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const messages = await Message.find({ chat: req.params.chatId })
      .populate('sender', 'name avatar')
      .sort({ createdAt: -1 }) // Newest first
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Message.countDocuments({ chat: req.params.chatId });

    res.json({
      messages: messages.reverse(), // Reverse to show oldest first in UI
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalMessages: total
      }
    });
  } catch (err) {
    console.error('Get messages error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// NEW: Mark messages as read
exports.markMessagesAsRead = async (req, res) => {
  const { chatId } = req.params;

  try {
    // Verify user is member of this chat
    const chat = await Chat.findById(chatId);
    if (!chat || !chat.members.includes(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Mark all unread messages in this chat as read by current user
    await Message.updateMany(
      {
        chat: chatId,
        readBy: { $ne: req.user.id } // Not already read by user
      },
      {
        $addToSet: { readBy: req.user.id } // Add user to readBy array
      }
    );

    res.json({ message: 'Messages marked as read' });
  } catch (err) {
    console.error('Mark messages as read error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// NEW: Get online users (you'll need this for Socket.IO)
exports.getOnlineUsers = async (req, res) => {
  try {
    // This would work with your connectedUsers Map from server.js
    // You'll need to expose it or use Redis for production
    res.json({ message: 'Online users endpoint - implement with Redis' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// MESSAGE SEARCH FUNCTIONALITY
exports.searchMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { query, page = 1, limit = 20 } = req.query;
    
    const chat = await Chat.findById(chatId);
    if (!chat || !chat.members.includes(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const skip = (page - 1) * limit;
    
    const messages = await Message.find({
      chat: chatId,
      text: { $regex: query, $options: 'i' },
      isDeleted: false // Don't search deleted messages
    })
    .populate('sender', 'name avatar')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));
    
    res.json({ messages, query });
  } catch (err) {
    res.status(500).json({ message: 'Search failed' });
  }
};

// DELETE MESSAGES
exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    // Only sender can delete their message
    if (message.sender.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // Soft delete - just mark as deleted
    message.text = 'This message was deleted';
    message.isDeleted = true;
    await message.save();
    
    res.json({ message: 'Message deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// BLOCK/UNBLOCK USERS
const BlockedUser = require('../models/BlockedUser');

exports.blockUser = async (req, res) => {
  try {
    const { userId } = req.body;
    
    // Check if already blocked
    const existingBlock = await BlockedUser.findOne({
      blocker: req.user.id,
      blocked: userId
    });
    
    if (existingBlock) {
      return res.status(400).json({ message: 'User already blocked' });
    }
    
    await BlockedUser.create({
      blocker: req.user.id,
      blocked: userId
    });
    
    res.json({ message: 'User blocked' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.unblockUser = async (req, res) => {
  try {
    const { userId } = req.body;
    
    await BlockedUser.findOneAndDelete({
      blocker: req.user.id,
      blocked: userId
    });
    
    res.json({ message: 'User unblocked' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// FILE/IMAGE SHARING IN CHAT
exports.sendFileMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // Verify user is member of this chat
    const chat = await Chat.findById(chatId);
    if (!chat || !chat.members.includes(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const isImage = file.mimetype.startsWith('image/');
    
    const message = await Message.create({
      chat: chatId,
      sender: req.user.id,
      text: req.body.text || `Shared a ${isImage ? 'photo' : 'file'}`,
      fileUrl: file.filename,
      fileType: file.mimetype,
      fileName: file.originalname,
      messageType: isImage ? 'image' : 'file',
      readBy: [req.user.id]
    });
    
    // Populate sender info
    await message.populate('sender', 'name avatar');
    
    await Chat.findByIdAndUpdate(chatId, { 
      lastMessage: message._id,
      updatedAt: new Date()
    });
    
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};