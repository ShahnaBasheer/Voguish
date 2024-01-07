const asyncHandler = require('express-async-handler');
const Cart = require('../models/cartModel');
const { findCart, cartQty, selectCartItem, getAllBrands } = require('../helperfns');


//get Cart page
const getCartPage = asyncHandler(async (req,res) => {
    const user = req.user,cartDetails = await findCart(user);
    const totalQty = await cartQty(user)
    const Brands = await getAllBrands();    
    res.render('users/cart',{user,cartDetails,Brands,totalQty,bodyjs:'/js/cart.js'});
});

//display getcart page
const getCartList = asyncHandler( async (req,res) => {
    res.render('admin/cartlist',{admin:true,adminInfo:req.user});
  });

  

const addToCart = asyncHandler(async (req, res) => {
    try {
        const { slug } = req.params;
        const isValid = await selectCartItem(slug,req);

        if(isValid.result){
            const totalQty = await cartQty(req?.user);
            res.status(200).json({totalQty, redirect: req.header('Referer')}); 
        }else{
            if(isValid.exist){
                res.status(400).json({exist: true});
            } else {
                res.status(400).json({exist: false});
            }   
        }
    } catch (error) {
        res.status(500).json({message: 'Something went wrong!'})
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
        next(error);
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
    

}