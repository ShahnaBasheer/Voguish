const asyncHandler = require('express-async-handler');
const Product = require('../models/productModel');
const Cart = require('../models/cartModel');
const User = require('../models/userModel');
const { findCart, cartQty, selectCartItem } = require('../helperfns');
const CartItem = require('../models/cartItemModel');


//get Cart page
const getCartPage = asyncHandler(async (req,res) => {
    const user = req.user,cartDetails = await findCart(user);
    const totalQty = await cartQty(user);
    res.render('users/cart',{user,cartDetails,totalQty,bodyjs:'/js/cart.js'});
});

//display getcart page
const getCartList = asyncHandler( async (req,res) => {
    res.render('admin/cartlist',{admin:true,adminInfo:req.user});
  });

//get Contact page 
const getCheckoutPage = asyncHandler( async (req,res) => {
    const user = await User.findById(req.user.id)
    .populate('addresses').populate('defaultAddress').lean();
    const cartDetails = await findCart(user);
    const totalQty = await cartQty(user);
    res.render('users/checkout',{user,cartDetails,totalQty,
        bodycss:'/css/checkout.css',bodyjs:'/js/checkout.js'});
  });
  
  
const addToCart = asyncHandler(async (req, res) => {
    const { slug } = req.params;
    try {
        await selectCartItem(slug,req);
        return res.redirect(req.header('Referer'))
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


const checkSize = asyncHandler(async (req, res) => {
    const { slug } = req.params;
    const { size, color } = req.query;
    try {
        let cartExist = true;
        const userCart = await Cart.findOne({ user: req.user?._id })
            .populate({
                path: 'items.cartItem',
                populate: {
                    path: 'product',
                    model: 'Product'
                }
            });
        const productExistsInCart = userCart && userCart.items.find(item =>
            item.cartItem.product.slug === slug &&
            item.cartItem.size === size &&
            item.cartItem.color === color
    );
    if (!productExistsInCart) cartExist = false
    res.status(200).json({cartExist});
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

const removeCartItem = asyncHandler( async (req,res) =>{
    const { id } = req.params;
    try {
        const cart = await Cart.findOne({user:req.user._id});
        cart.items = cart.items.filter(item => item.cartItem.toString() !== id);
        await cart.save();
        return res.redirect('/cart')
    } catch (error) {
        console.log(error)
    }
});

const quantityPlus = asyncHandler( async(req,res) => {
    const { id } = req.params
    try {
        const cart = await Cart.findOne({user:req.user._id});
        const item = cart.items.find(item => item.id === id );
        item.quantity++;
        await cart.save();
        return res.redirect('/cart');
    } catch (error) {
        console.log(error);
    }
});

const quantityMinus = asyncHandler( async(req,res) => {
    const { id } = req.params
    try {
        const cart = await Cart.findOne({user:req.user._id});
        const item = cart.items.find(item => item.id === id );
        item.quantity--;
        await cart.save();
        return res.redirect('/cart');
    } catch (error) {
        console.log(error);
    }
});


module.exports = {
    getCartPage,
    addToCart,
    checkSize,
    removeCartItem,
    quantityPlus,
    quantityMinus,
    getCartList,
    getCheckoutPage,

}