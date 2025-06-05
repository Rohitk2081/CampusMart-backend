const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');

dotenv.config();
const app = express();
connectDB();

// Create HTTP server and attach Socket.IO
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/listings', require('./routes/listingRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/chats', require('./routes/chatRoutes'));

// Enhanced Socket.IO logic
const connectedUsers = new Map(); // userId -> socketId
const userSockets = new Map();    // socketId -> userId

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  // User joins their personal room
  socket.on('join', (userId) => {
    socket.join(userId);
    connectedUsers.set(userId, socket.id);
    userSockets.set(socket.id, userId);
    
    // Notify friends that user is online
    socket.broadcast.emit('userOnline', userId);
    
    console.log(`User ${userId} joined room`);
  });

  // Handle sending messages
  socket.on('sendMessage', async ({ chatId, senderId, receiverId, text }) => {
    try {
      // Emit to receiver's room
      io.to(receiverId).emit('receiveMessage', {
        chatId,
        senderId,
        text,
        timestamp: new Date()
      });

      // Emit back to sender for confirmation
      socket.emit('messageSent', {
        chatId,
        text,
        timestamp: new Date(),
        status: 'delivered'
      });

      // Update chat's updatedAt timestamp for proper sorting
      // You might want to do this in the controller instead
      
    } catch (error) {
      socket.emit('messageError', { error: 'Failed to send message' });
    }
  });

  // Handle message read receipts
  socket.on('markAsRead', ({ chatId, userId }) => {
    // Notify the other user that messages were read
    socket.to(chatId).emit('messagesRead', { chatId, userId });
  });

  // Handle typing indicators
  socket.on('typing', ({ chatId, userId, isTyping }) => {
    socket.to(chatId).emit('userTyping', { userId, isTyping });
  });

  // Join specific chat rooms for typing indicators
  socket.on('joinChat', (chatId) => {
    socket.join(chatId);
    console.log(`Socket ${socket.id} joined chat ${chatId}`);
  });

  // Leave chat room
  socket.on('leaveChat', (chatId) => {
    socket.leave(chatId);
    console.log(`Socket ${socket.id} left chat ${chatId}`);
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    const userId = userSockets.get(socket.id);
    if (userId) {
      connectedUsers.delete(userId);
      userSockets.delete(socket.id);
      
      // Notify friends that user is offline
      socket.broadcast.emit('userOffline', userId);
    }
    console.log('Socket disconnected:', socket.id);
  });
});

// Make connectedUsers available to routes (for online status)
app.set('connectedUsers', connectedUsers);

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));