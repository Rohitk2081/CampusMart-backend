const express = require('express');
const router = express.Router();
const { googleLogin } = require('../controllers/authController');

router.post('/google-login', googleLogin);

module.exports = router;

const { registerUser, loginUser } = require('../controllers/authController');

router.post('/register', registerUser);
router.post('/login', loginUser);