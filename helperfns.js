const slugify = require('slugify');
const shortid = require('shortid');
const Product = require('./models/productModel');
const otpGenerator = require('otp-generator');
const sendEmail = require('./utils/sendMail');
const User = require('./models/userModel');
const Cart = require('./models/cartModel');
const CartItem = require('./models/cartItemModel');



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


const selectCartItem = async( slug, req ) => {
  const product = await Product.findOne({ slug });
  const existingCart = await Cart.findOne({user:req.user});
  let selectSize,selectColor;

  if (!product) return res.status(404).json({ message: 'Product not found' });        

  const validOptionFound = Array.from(product.sizes.keys()).some(size => {
      const availableColor = product.sizes.get(size).find(item => item.stock > 0);
      if (availableColor) {
          selectSize = size;
          selectColor = availableColor.color;
          return true; // Exit the loop if a valid option is found
      }
      return false;
  });
  if (!validOptionFound) {
      return res.status(400).json({ message: 'Product is out of stock!' });
  }    
  let item = { 
      product: product._id, 
      size: req.query.size || selectSize, 
      color:  req.query.color || selectColor, 
  }
  let cartItemExist = await CartItem.findOne(item);

  if (!cartItemExist) {
      const newCartItem = new CartItem(item);
      await newCartItem.save();
      cartItemExist = newCartItem; 
  }
   
  if (!existingCart) {
      const newCart = new Cart({ user: req.user?._id, items: [{ cartItem: cartItemExist._id, quantity: req.query.qty || 1 }] });
      await newCart.save();
  } else {
      let index;
      let itemExist = existingCart.items.some((item,i) =>{
          index =  i;
          return item.cartItem.toString() === cartItemExist._id.toString()
      });
      if(!itemExist){
          existingCart.items.push({ cartItem: cartItemExist._id, quantity: req.query.qty || 1 });
      }else existingCart.items[index].quantity++;
      await existingCart.save();
  }
}

module.exports = { createUniqueSlug, otpEmailSend,
       generateOrderId, findCart, cartQty,
       selectCartItem }