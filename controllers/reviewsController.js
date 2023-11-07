const asyncHandler = require('express-async-handler');
const User = require('../models/ordersModel');
const { cartQty } = require('../helperfns');


const getReviewsPage = asyncHandler( async(req,res) => {
  const user = req.user, totalQty = await cartQty(user);
  const userprofile  = await User.findById(req.user.id).populate('addresses').populate('defaultAddress').lean();
  res.render('users/reviewsInfo',{user,userprofile,totalQty,
      bodycss:'/css/myprofile.css',bodyjs:'/js/myprofile.js'});
});

module.exports = { getReviewsPage }