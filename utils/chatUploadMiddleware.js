const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure chat upload directory exists
const chatUploadDir = 'uploads/chat';
if (!fs.existsSync(chatUploadDir)) {
  fs.mkdirSync(chatUploadDir, { recursive: true });
}

// FILE/IMAGE SHARING IN CHAT
const chatUpload = multer({
  storage: multer.diskStorage({
    destination: 'uploads/chat/',
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `chat-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
    }
  }),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowed = ['.png', '.jpg', '.jpeg', '.gif', '.pdf', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, allowed.includes(ext));
  }
});

module.exports = chatUpload;