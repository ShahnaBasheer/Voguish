
const validator = require('validator');
const User = require('../models/userModel');

async function isValidEmail(email) {
    
    if (!validator.isEmail(email)) {
        return "Invalid email format";
    }
    const existingUser = await User.findOne({ email }).exec();
    if (existingUser) {
        return "Email already exists";
    }
    return "Email available!";
}

async function isEmailValid(email){
    if (validator.isEmail(email)) {
        if(!await User.findOne({ email }).exec()) return true;
    }
    return false;
}

module.exports = { isValidEmail, isEmailValid };
