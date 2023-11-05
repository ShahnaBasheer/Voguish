const slugify = require('slugify');
const shortid = require('shortid');
const Product = require('./models/productModel');
const otpGenerator = require('otp-generator');
const sendEmail = require('./utils/sendMail');
const User = require('./models/userModel');
const Cart = require('./models/cartModel');



const createUniqueSlug = async (title) => {
  try{
      let slug = slugify(title)
      let existingProduct = await Product.findOne({ slug });
      
      while (existingProduct) {
          let slugId = shortid.generate();
          slug = `${slug}-${slugId}`;
          existingProduct = await Product.findOne({ slug });
      }  
      return slug;
  }catch(error){
    console.log(error);
  } 
}

const otpEmailSend = async (req,userCreate,oldEmail) => {
  try{
      const otp =  otpGenerator.generate(6, {specialChars: false });
      req.body.otp =  otp;
      req.body.otpTimestamp = new Date();
    
      const subject = "OTP Verification";
      const text = `Your OTP for email verification is: ${otp}`;
      if(userCreate){
         await User.create(req.body);
      }else if(userCreate == "profile_setting"){
        await sendEmail(oldEmail, subject, text);
      }else{
          await User.updateOne(
            { email:req.body.email },
            { $set: { otp, otpTimestamp: new Date() } }
          );
      }
      await sendEmail(req.body.email, subject, text);
  }catch(error){
      console.log("problem with sending email")
      console.log(error);
  }
};

const generateOrderId = () => {
  const prefix = 'ORD'; // Order ID prefix
  const uniqueNumber = Math.floor(Math.random() * 10000); // Generate a random number
  const timestamp = Date.now(); // Get current timestamp
  const orderId = `${prefix}-${uniqueNumber}-${timestamp}`; // Combine prefix, random number, and timestamp
  return orderId;
};

const findCart = async (user) => {
  const cart = await Cart.findOne({ user: user?._id })
    .populate({
        path: 'user',
        model: 'User' 
    })
    .populate({
        path: 'items.cartItem',
        populate: {
            path: 'product',
            model: 'Product'
        }
    }).lean()
    if(cart) return cart
    return 0;
}

const cartQty = async (user) => {
    cartDetails = await findCart(user);
    let qty = 0;
    if (cartDetails) {
       qty = cartDetails.items.reduce((total, cartitem) => total + cartitem.quantity, 0);
    }
    return qty;
}


module.exports = { createUniqueSlug, otpEmailSend,
       generateOrderId, findCart, cartQty }