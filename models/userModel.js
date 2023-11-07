const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Declare the Schema of the Mongo model
const userSchema = new mongoose.Schema({
    firstname:{
        type:String,
        required:true,
    },
    lastname:{
        type:String,
        required:true,
    },
    gender: {
        type:String,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    phone:{
        type:String,
        unique:true,
    },
    password:{
        type:String,
        required:true,
    },
    role:{
        type:String,
        enum: ['user', 'admin'],
        default : "user",
    },
    addresses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address', 
    }],
    defaultAddress: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address', 
    },
    isBlocked : {
        type: Boolean,
        default: false,
    },
    refreshToken: {
         type: String 
    },
    otp: {
        type: String,
    },
    otpTimestamp: {
        type: Number,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    phoneVerified: {
        type: Boolean,
        default: false, 
    },
    },{ timestamps: true },
);

userSchema.pre('save', async function(next) {
    if(this.isModified('password')){
      const salt = bcrypt.genSaltSync(10); //saltRounds 10
      this.password = await bcrypt.hash(this.password, salt);
    }
  });
 
userSchema.methods.comparePassword = async function(enteredPassword) {
      return await bcrypt.compare(enteredPassword, this.password);
  };
//Export the model
module.exports = mongoose.model('User', userSchema);