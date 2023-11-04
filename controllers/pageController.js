const asyncHandler = require('express-async-handler');
const Product = require('../models/productModel');;
const { findCart, cartQty } = require('../helperfns');


//Display Login page
const getLoginPage = asyncHandler(async (req,res) => {
   const successMessage = req.query.success; 
   res.render('users/signin',{bodycss:'css/login_signup.css',successMessage}); 
});

//Display Signup page
const getSignupPage = asyncHandler( async (req,res) => {
   res.render('users/signup',{bodycss:'css/login_signup.css',
   bodyjs:'js/signUp.js'});
});

//Display Home page
const getHomePage = asyncHandler(async (req,res) => {
   try{ 
        let user = req?.user, totalQty = await cartQty(user);
        const newarrivals = await Product.find().populate('brand')
            .populate('category').sort({ createdAt: -1 }).limit(5).lean();
        res.render('users/home',{user,newarrivals,totalQty,
           bodycss:'css/nav_footer.css',maincss:'css/home.css'});
   } catch(error){
       console.log(error)
       
   }
});

//Display Women page
const getWomenPage = asyncHandler( async (req,res) => {
   try{
        let user = req?.user, totalQty = await cartQty(user);
        const products = await Product.find({gender:"women"}).populate('brand').lean();
        res.render('users/category_page',{bodycss:'css/nav_footer.css',
           maincss:'css/category_page.css',main:"women",products,user,totalQty});  
   } catch(error) {
       throw new Error(error);
   }
});

//Display Men page
const getMenPage = asyncHandler( async (req,res) => {
   try{
        let user = req?.user, totalQty = await cartQty(user);
        const products = await Product.find({gender:"men"}).populate('brand').lean();
        res.render('users/category_page',{bodycss:'css/nav_footer.css',
           maincss:'css/category_page.css',main:"men",products,user,totalQty});  
   } catch(error) {
      throw new Error(error);
   }
});


//Display Kids page
const getKidsPage = asyncHandler( async (req,res) => {
   try{
        let user = req?.user, totalQty = await cartQty(user);
        const products = await Product.find({gender:{ $in: ["girls", "boys"] } })
           .populate('brand').lean();
        res.render('users/category_page',{bodycss:'css/nav_footer.css',
           maincss:'css/category_page.css',main:"kids",products,user,totalQty});  
   } catch(error) {
      throw new Error(error);
   }
});

//Display Girls page
const getGirlsPage = asyncHandler( async (req,res) => {
   try{
        let user = req?.user, totalQty = await cartQty(user);
        const products = await Product.find({gender:"girls"}).populate('brand').lean();
        res.render('users/category_page',{bodycss:'css/nav_footer.css',
           maincss:'css/category_page.css',main:"girls",products,user,totalQty});  
   } catch(error) {
      throw new Error(error);
   }
});

//Display Boys page
const getBoysPage = asyncHandler( async (req,res) => {
   try{
        let user = req?.user, totalQty = await cartQty(user);
        const products = await Product.find({gender:"boys"}).populate('brand').lean();
        res.render('users/category_page',{bodycss:'css/nav_footer.css',
           maincss:'css/category_page.css',main:"boys",products,user,totalQty});  
   } catch(error) {
      throw new Error(error);
   }
});

//get Contact page 
const getContactPage = asyncHandler( async (req,res) => {
   let user = req?.user, totalQty = await cartQty(user);
   res.render('users/contact',{user,totalQty});
});

//otp verification
const otpVerify = asyncHandler(async(req,res) => {
   res.render('users/otpverification',{bodyjs:'js/otp.js'});
});


//Display Admin Dashboard
const getDashboard = asyncHandler( async (req,res) => {
   res.render('admin/dashboard',{admin:true,adminInfo:req.user});
});

//Display Admin Login
const getAdminLogin = asyncHandler( async (req,res) => {
   res.render('admin/adminLogin',{admin:true,adminlogin:true,bodycss:'/css/login_signup.css'});
});

//display account-blocked page
const getBlocked = asyncHandler (async(req,res) => {
   res.render('users/account-blocked');
});




module.exports = {
    getLoginPage,
    getSignupPage,
    getHomePage,
    getWomenPage,
    getMenPage,
    getKidsPage,
    getGirlsPage,
    getBoysPage,
    getDashboard,
    getAdminLogin,
    getBlocked,
    otpVerify,
    getContactPage,  
}