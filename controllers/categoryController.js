const fs = require('fs');
const path = require('path');
const Category = require(path.join(__dirname, '../models/category'));
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, './uploads/category_images');
    },
    filename: function (req, file, callback) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const filename = `${uniqueSuffix}-${file.originalname}`;
        callback(null, filename);
    },
});

const upload = multer({ storage: storage }).single('categoryImage');

const categoryController = {

    async addCategory(req, res) {
        try {
            upload(req, res, async function (err) {
                if (err) {
                    console.error(err);
                    return res.status(500).send('File upload failed');
                }

                const { categoryId, categoryName } = req.body;
                const categoryImage = req.file ? `uploads/category_images/${req.file.filename}` : null;

                const newCategory = new Category({
                    categoryId,
                    categoryName,
                    categoryImage,
                });
                await newCategory.save();
                res.send("<script>alert('msg: Category Added Successfully'); window.location.href='/category/addCategory';</script>");

            });
        } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    },
    

    addCategoryForm(req, res) {
        res.render('category_form')
    },

    async displayCategories(req, res) {
        try {
            const userCookie = req.cookies.user;
    
            if (!userCookie) {
                return res.redirect('/auth/login');
            }

            const categories = await Category.find();
                res.render('categories', { categories });
        } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    },

    async deleteCategory(req, res) {
        try {
          const category = await Category.findById(req.params.id);
      
          if (!category) {
            return res.status(404).send('Category not found');
          }
      
          if (category.categoryImage) {
            const imagePath = path.join(__dirname, '../', category.categoryImage);
      
            await fs.promises.unlink(imagePath);
          }
      
          await Category.findByIdAndDelete(req.params.id);
          res.redirect('/category/displayCategories');
        } catch (error) {
          console.error(error);
          res.status(500).send('Internal Server Error');
        }
    },

    async editCategoryGet(req, res) {
        try {
            const category = await Category.findById(req.params.id);
            if (!category) {
              return res.status(404).send('Category not found');
            }
            res.render('edit_category', { category });
          } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    },   
    
    async editCategoryPost(req, res) {
        try {
            const existingCategoryData = await Category.findById(req.params.id);
        
            upload(req, res, async function (err) {
              if (err) {
                console.error(err);
                return res.status(500).send('Error uploading file');
              }
              const { categoryId, categoryName } = req.body;
              let updatedData = {
                categoryId,
                categoryName,
              };
        
              if (req.file) {
                const categoryImagePath = `uploads/category_images/${req.file.filename}`;
                updatedData.categoryImage = categoryImagePath;
        
                if (existingCategoryData.categoryImage) {
                  const previousImagePath = path.join(__dirname, '../', existingCategoryData.categoryImage);
                  fs.unlinkSync(previousImagePath);
                }
              }
              await Category.findByIdAndUpdate(req.params.id, updatedData);
              res.redirect('/category/displayCategories');
            });
          } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    }
};


module.exports = categoryController;
