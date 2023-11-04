const { parsePhoneNumberFromString } = require('libphonenumber-js');
const User = require('../models/userModel'); 

async function validatePhoneNumber(phone) {
    const phoneNumberObj = parsePhoneNumberFromString(phone, 'IN');

    if (phoneNumberObj && phoneNumberObj.isValid()) {
        const existingUser = await User.findOne({ phone }).exec();
        if (existingUser) return "Phone number already exists!"
        else return "Phone number available!";
    } else {
        return "Invalid phone number";
    }
}

async function validateMobile(phone){
    const phoneNumberObj = parsePhoneNumberFromString(phone, 'IN');
    if (phoneNumberObj && phoneNumberObj.isValid()){
        if(!await User.findOne({ phone }).exec()) return true;
    }
    return false;
}
module.exports = { validatePhoneNumber, validateMobile };
