const mongoose = require('mongoose');

// Declare the Schema of the Category model
const allowedCategories = ['Indianwear','Westernwear','Sportswear','Bottomwear','Maternitywear','Nightwear','Lingerie','Topwear'];

const categorySchema = new mongoose.Schema({
    category: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    maincategory: {
        type: String, // Use String type for parent field
        enum: allowedCategories, // Define allowed values using enum
        default: null,
        required: true,
    },
});

module.exports = mongoose.model('Category', categorySchema);
