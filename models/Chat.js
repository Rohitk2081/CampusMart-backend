const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
  // ✅ Latest message reference for chat list preview
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  }

}, { timestamps: true });

module.exports = mongoose.model('Chat', chatSchema);