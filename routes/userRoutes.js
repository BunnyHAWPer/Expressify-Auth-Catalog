const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/edit/:id', userController.editUserGet);
router.post('/edit/:id', userController.editUserPost);
router.get('/delete/:id', userController.deleteUser);
router.get('/users', userController.displayUsers);


module.exports = router;
