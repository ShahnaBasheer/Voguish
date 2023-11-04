const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema({
    brand: {
        type: String,
        required: true,
        unique: true,
    },
    description: {
        type: String,
    },
    country: {
        type: String,
        required: true,
    }, 

});

module.exports = mongoose.model('Brand', brandSchema);
