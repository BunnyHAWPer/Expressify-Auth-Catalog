const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    categoryId: {
        type: Number,
        required: true,
        unique: true,
    },
    categoryName: {
        type: String,
        required: true,
        unique: true,
    },
    categoryImage: {
        type: String,
    },
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
