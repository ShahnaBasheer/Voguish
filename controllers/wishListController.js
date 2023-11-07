const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const Product = require('../models/productModel');
const WishList = require('../models/wishListModel');
const { cartQty, selectCartItem } = require('../helperfns');


const getWishList = asyncHandler( async (req,res) => {
    const user = req.user, totalQty = await cartQty(user);
    const wishlist = await WishList.findOne({user:user._id})
    .populate({
        path: 'products',
        populate: {
            path: 'brand',
            model: 'Brand'
        }
    }).lean();
       console.log(wishlist)
    res.render('users/wishList',{user,wishlist,totalQty,
        bodycss:'/css/myprofile.css',bodyjs:'/js/myprofile.js'});
});


const addToWishList = asyncHandler( async (req,res) => {
    try {
        const { slug } = req.params;
        const product = await Product.findOne({slug});
        const wishlist = await WishList.findOne({user: req.user._id});
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        if(!wishlist){
            await WishList.create({ products : [product._id],user: req.user._id});
        }else{
            if (!wishlist.products.includes(product._id)) {
                wishlist.products.push(product._id);
                await wishlist.save();
            }
        }
        res.status(200).json({ message: 'Product added to wishlist successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


const deleteWishList = asyncHandler( async (req,res) => {
     try {
        const { slug } = req.params;
        const product = await Product.findOne({slug});
        const wishlist = await WishList.findOne({user: req.user._id});
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        if (!wishlist || !wishlist.products.includes(product._id)) {
            return res.status(404).json({ error: 'Product not found in the wishlist' });
        }
        wishlist.products = wishlist.products.filter(
            productId => productId.toString() !== product._id.toString());
        await wishlist.save();

        res.status(200).json({ message: 'Product deleted from wishlist successfully' });
     } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
     }
});

const moveToCart = asyncHandler( async(req,res) => {
    const { slug } = req.params;
    try {
        const product = await Product.findOne({slug});
        const wishlist = await WishList.findOne({ user: req.user._id });

        if (!product || !wishlist || !wishlist.products.includes(product._id)) {
            return res.status(404).json({ error: 'Product not found in the wishlist' });
        }
        await selectCartItem(slug,req);

        wishlist.products = wishlist.products.filter(productId => productId.toString() !== product._id.toString());
        await wishlist.save();

        return res.redirect(req.header('Referer'));
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


module.exports = { addToWishList, getWishList,
        deleteWishList, moveToCart,
    }