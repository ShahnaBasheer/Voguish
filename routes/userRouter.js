const express = require('express');
const { createUser, loginUser, logout,
        emailCheck, phoneCheck, resendOtpCode,
        otpVerification } = require('../controllers/userController');
const { getProfilePage, editProfile, addNewAddress,
        editAddress, deleteAddress, defaultAddress,
        getAddressPage } = require('../controllers/profileController');
const { getWomenPage, getMenPage, getKidsPage,
        getGirlsPage, getBoysPage,getLoginPage,
        getHomePage, getSignupPage, getBlocked,
        otpVerify, getContactPage} = require('../controllers/pageController');
const { getProduct }  = require('../controllers/productController');
const { getCartPage, addToCart, checkSize, removeCartItem,
        quantityPlus, quantityMinus } = require('../controllers/cartController');
const { createOrders, getOrdersPage, razorpayPayment,
        getOrdersDetails, generateInvoice, getCheckoutPage } = require('../controllers/ordersController');
const { addToWishList, getWishList, deleteWishList,
        moveToCart } = require('../controllers/wishListController');
const { applyCoupon } = require('../controllers/couponsController');
const { getBrand } = require('../controllers/brandController');
const { filterProducts } = require('../controllers/filterController');
const { getWallet, addToWallet, redeemFromWallet } = require('../controllers/walletController');
const { getReviewsPage, addNewReview } = require('../controllers/reviewsController');
const { authMiddleware, isUser, isLoggedInUser} = require('../middlewares/authMiddlewares');
const { removeEmptyStrings, limiter } = require('../middlewares/otherMiddlewares');
const router = express.Router();
const nocache = require('nocache');



router.get('/', nocache(), authMiddleware, isUser, getHomePage);
router.get('/home', nocache(), authMiddleware, isUser, getHomePage);
router.get('/login', nocache(),  authMiddleware,isLoggedInUser, getLoginPage);
router.post('/login', nocache(),authMiddleware, isLoggedInUser, loginUser);
router.get('/signup', nocache() , getSignupPage);
router.post('/signup',nocache(), authMiddleware, isUser, createUser);
router.get('/logout', nocache(), authMiddleware, isUser, logout);
router.get('/check-email',nocache(), emailCheck);
router.get('/check-phone',nocache(), phoneCheck);
router.post('/otp-verification', nocache(), otpVerification);
router.get('/otp-verification', nocache(), otpVerify);
router.post('/resend-otp', nocache(), limiter, resendOtpCode);
router.get('/women', nocache(), authMiddleware, isUser, getWomenPage);
router.get('/men', nocache(), authMiddleware, isUser, getMenPage);
router.get('/kids', nocache(), authMiddleware, isUser, getKidsPage);
router.get('/girls', nocache(), isUser, getGirlsPage);
router.get('/boys', nocache(), authMiddleware, isUser, getBoysPage);
router.get('/product/:slug', nocache(), authMiddleware, isUser, getProduct);
router.get('/account-blocked', nocache(),authMiddleware, isUser, getBlocked);
router.get('/cart', nocache(), authMiddleware, isUser, getCartPage);
router.get('/cart/addtocart/:slug', nocache(), authMiddleware, isUser, addToCart);
router.get('/cart/check-size-color/:slug', nocache(), authMiddleware, isUser, checkSize);
router.get('/cart/cart-item-remove/:id', nocache(), authMiddleware, isUser, removeCartItem);
router.get('/cart/qty-plus/:id', nocache(), authMiddleware, isUser, quantityPlus);
router.get('/cart/qty-minus/:id', nocache(), authMiddleware, isUser, quantityMinus);
router.get('/checkout', nocache(), authMiddleware, isUser, getCheckoutPage);
router.post('/checkout/orders/', nocache(), authMiddleware, isUser, removeEmptyStrings, createOrders);
router.post('/checkout/apply-coupon',nocache() ,authMiddleware , isUser, applyCoupon);
router.get('/orders', nocache(), authMiddleware, isUser, getOrdersPage);
router.get('/orders/order-details', nocache(), authMiddleware, isUser, getOrdersDetails);
router.get('/orders/generate-invoice', nocache(), authMiddleware, isUser, generateInvoice)
router.post('/razorpay/order-payment', nocache(), authMiddleware, isUser, razorpayPayment);
router.get('/contact', nocache(), authMiddleware, isUser, getContactPage);
router.get('/profile', nocache(), authMiddleware, isUser, getProfilePage);
router.get('/profile/address', nocache(), authMiddleware, isUser, getAddressPage);
router.post('/profile/edit', nocache(), authMiddleware, isUser, editProfile);
router.post('/profile/add-address', nocache(), authMiddleware, isUser, removeEmptyStrings, addNewAddress);
router.post('/profile/edit-address', nocache(), authMiddleware, isUser, removeEmptyStrings, editAddress);
router.delete('/profile/delete-address/:id', nocache(), authMiddleware, isUser, deleteAddress);
router.post('/profile/default-address', nocache(), authMiddleware, isUser, removeEmptyStrings, defaultAddress);
router.get('/wishlist', nocache(), authMiddleware, isUser, getWishList);
router.get('/wishlist/add-to-wishlist/:slug', nocache(), authMiddleware, isUser, addToWishList)
router.get('/wishList/delete-item/:slug', nocache(), authMiddleware, isUser, deleteWishList);
router.get('/wishList/moveToCart/:slug', nocache(), authMiddleware, isUser, moveToCart);
router.get('/wallet', nocache(), authMiddleware, isUser, getWallet);
router.post('/wallet/add-wallet-money', nocache(), authMiddleware, isUser, addToWallet);
router.post('/wallet/redeem-wallet-money', nocache(), authMiddleware, isUser, redeemFromWallet);
router.get('/profile/reviews', nocache(), authMiddleware, isUser, getReviewsPage);
router.post('/reviews/add-review', nocache(), authMiddleware, isUser, removeEmptyStrings, addNewReview );
router.get('/brand/', nocache(), authMiddleware, isUser, getBrand);
router.get('/filters', nocache(), authMiddleware, isUser, filterProducts);




module.exports = router;