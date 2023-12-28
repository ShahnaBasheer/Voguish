const asyncHandler = require('express-async-handler');
const User = require('../models/ordersModel');
const { cartQty } = require('../helperfns');
const Review = require('../models/reviewModel');
const Product = require('../models/productModel');


const getReviewsPage = asyncHandler( async(req,res) => {
    const user = req?.user, 
        totalQty = await cartQty(user),
        userprofile  = await User.findById(req?.user?.id)
            .populate('addresses')
            .populate('defaultAddress').lean();
    res.render('users/reviewsInfo',{user,userprofile,totalQty,
        bodycss:'/css/myprofile.css',bodyjs:'/js/myprofile.js'});
});


const addNewReview = asyncHandler( async(req,res) => {
    const { product_slug, title, comment, rating } = req?.body;
    const product = await Product.findOne({ slug: product_slug });
    let totalRating = totalReviews = 0; 

    if(!product){
        return res.status(400).json({ error: 'Product not found!' });
    }
    if (rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Invalid rating value. Rating must be between 1 and 5.' });
    }

    const review = await Review.findOne({product:product?._id,postedBy : req?.user?.id});
    
    if(review){
        await review?.updateOne({ title, comment, rating})
        await review?.save();
    }else { 
       await Review.create({postedBy:req?.user?.id, product:product?._id, title, comment, rating});
    }

    const reviewsData = await Review.aggregate([
        { $match: { product: product?._id } },
        { $group: { _id: '$rating', count: { $sum: 1 } } },
        { $project: { _id: 0, rating: '$_id', count: 1} }
    ]);
        
    reviewsData.forEach(item => {
        totalRating += (item?.count * item?.rating);
        totalReviews += item?.count;
    });

    product.rating = (totalRating/totalReviews)?.toFixed(1);
    await product?.save();
    
    res.redirect(req.header('Referer'));
});

module.exports = { getReviewsPage, addNewReview }