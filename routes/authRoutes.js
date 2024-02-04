const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.get('/register', authController.showRegisterForm);
router.post('/register', authController.registerUser);

router.get('/verify/:token', authController.verifyUser);

router.get('/login', authController.showLoginForm);
router.post('/login', authController.loginUser);

router.post('/logout', authController.logout);

module.exports = router;
