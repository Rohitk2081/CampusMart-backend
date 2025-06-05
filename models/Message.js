const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  chat: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },

  // Track which users have read the message
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
  // NEW FIELDS for additional features:
  isDeleted: { type: Boolean, default: false },
  
  // File sharing fields
  fileUrl: String,        // filename in uploads/chat/
  fileType: String,       // mimetype
  fileName: String,       // original filename
  
  // Message type (text, image, file, etc.)
  messageType: {
    type: String,
    enum: ['text', 'image', 'file', 'system'],
    default: 'text'
  }
  
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);