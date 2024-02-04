const express = require('express');
const router = express.Router();
const apiController = require('../controllers/apiController');

router.post('/register', apiController.registerUserApi);
router.post('/login', apiController.loginUserApi);

module.exports = router;
