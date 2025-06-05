const rateLimit = require('express-rate-limit');

// MESSAGE VALIDATION MIDDLEWARE
const validateMessage = (req, res, next) => {
  const { text } = req.body;
  
  if (!text || text.trim().length === 0) {
    return res.status(400).json({ message: 'Message text is required' });
  }
  
  if (text.length > 1000) {
    return res.status(400).json({ message: 'Message too long' });
  }
  
  next();
};

// RATE LIMITING FOR MESSAGES
const messageRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // 30 messages per minute
  message: 'Too many messages sent, please slow down'
});

module.exports = {
  validateMessage,
  messageRateLimit
};