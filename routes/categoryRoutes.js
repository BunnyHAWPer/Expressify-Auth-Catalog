const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

router.get('/addCategory', categoryController.addCategoryForm);
router.post('/addCategory', categoryController.addCategory);

router.get('/editCategory/:id', categoryController.editCategoryGet);
router.post('/editCategory/:id', categoryController.editCategoryPost);
router.get('/deleteCategory/:id', categoryController.deleteCategory);
router.get('/displayCategories', categoryController.displayCategories);

module.exports = router;
