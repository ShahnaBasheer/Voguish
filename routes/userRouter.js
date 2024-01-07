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
        getOrdersDetails, generateInvoice, getCheckoutPage,
        getOrderConfirmation } = require('../controllers/ordersController');
const { addToWishList, getWishList, deleteWishList,
        moveToCart } = require('../controllers/wishListController');
const { applyCoupon } = require('../controllers/couponsController');
const { getBrand } = require('../controllers/brandController');
const { forgotPassword, resetPassword, changePassword,
        changeOldPassword} = require('../controllers/passwordController');
const { filterProducts, selectMenu, searchText } = require('../controllers/filterController');
const { getWallet, addToWallet, redeemFromWallet } = require('../controllers/walletController');
const { getReviewsPage, addNewReview } = require('../controllers/reviewsController');
const { authMiddleware, isUser, isUserLoggedIn, isNotLoginRedirct} = require('../middlewares/authMiddlewares');
const { removeEmptyStrings, limiter } = require('../middlewares/otherMiddlewares');
const router = express.Router();
const nocache = require('nocache');


router.get('/', nocache(), authMiddleware, isUser, getHomePage);
router.get('/home',nocache(), authMiddleware, isUser, getHomePage);
router.get('/login',nocache(), authMiddleware,isUserLoggedIn, getLoginPage);
router.post('/login',nocache(), authMiddleware, isUserLoggedIn, loginUser);
router.get('/signup',nocache(), getSignupPage);
router.post('/signup',nocache(), authMiddleware, isUser, createUser);
router.get('/logout',nocache(), authMiddleware, isUser, logout);
router.get('/check-email',nocache(), emailCheck);
router.get('/check-phone',nocache(), phoneCheck);
router.post('/otp-verification',nocache(), otpVerification);
router.get('/otp-verification',nocache(), otpVerify);
router.post('/resend-otp',nocache(), limiter, resendOtpCode);
router.get('/women',nocache(), authMiddleware, isUser, getWomenPage);
router.get('/men',nocache(), authMiddleware, isUser, getMenPage);
router.get('/kids',nocache(), authMiddleware, isUser, getKidsPage);
router.get('/girls',nocache(), isUser, getGirlsPage);
router.get('/boys',nocache(), authMiddleware, isUser, getBoysPage);
router.get('/product/:slug',nocache(), authMiddleware, isUser, getProduct);
router.get('/account-blocked',nocache(), authMiddleware, isUser, getBlocked);
router.get('/cart',nocache(), authMiddleware, isUser, getCartPage);
router.get('/cart/addtocart/:slug',nocache(), authMiddleware, isNotLoginRedirct, addToCart);
router.get('/cart/check-size-color/:slug',nocache(), authMiddleware, isNotLoginRedirct, checkSize);
router.get('/cart/cart-item-remove/:id',nocache(), authMiddleware, isNotLoginRedirct, removeCartItem);
router.get('/cart/qty-plus/:id',nocache(), authMiddleware, isNotLoginRedirct, quantityPlus);
router.get('/cart/qty-minus/:id',nocache(), authMiddleware, isNotLoginRedirct, quantityMinus);
router.get('/checkout',nocache(), authMiddleware, isNotLoginRedirct, getCheckoutPage);
router.post('/checkout/orders/',nocache(), authMiddleware, isNotLoginRedirct, removeEmptyStrings, createOrders);
router.post('/checkout/apply-coupon',nocache(), authMiddleware , isNotLoginRedirct, applyCoupon);
router.get('/orders',nocache(), authMiddleware, isNotLoginRedirct, getOrdersPage);
router.get('/orders/order-details',nocache(), authMiddleware, isNotLoginRedirct, getOrdersDetails);
router.get('/orders/generate-invoice',nocache(), authMiddleware, isNotLoginRedirct, generateInvoice)
router.post('/razorpay/order-payment',nocache(), authMiddleware, isNotLoginRedirct, razorpayPayment);
router.get('/contact',nocache(), authMiddleware, isUser, getContactPage);
router.get('/profile',nocache(), authMiddleware, isNotLoginRedirct, getProfilePage);
router.get('/profile/address',nocache(), authMiddleware, isNotLoginRedirct, getAddressPage);
router.post('/profile/edit',nocache(), authMiddleware, isNotLoginRedirct, editProfile);
router.post('/profile/add-address',nocache(), authMiddleware, isNotLoginRedirct, removeEmptyStrings, addNewAddress);
router.post('/profile/edit-address',nocache(), authMiddleware, isNotLoginRedirct, removeEmptyStrings, editAddress);
router.delete('/profile/delete-address/:id',nocache(), authMiddleware, isNotLoginRedirct, deleteAddress);
router.post('/profile/default-address',nocache(), authMiddleware, isNotLoginRedirct, removeEmptyStrings, defaultAddress);
router.get('/wishlist',nocache(), authMiddleware, isNotLoginRedirct, getWishList);
router.get('/wishlist/add-to-wishlist/:slug',nocache(), authMiddleware, isNotLoginRedirct, addToWishList)
router.get('/wishList/delete-item/:slug',nocache(), authMiddleware, isNotLoginRedirct, deleteWishList);
router.get('/wishList/moveToCart/:slug',nocache(), authMiddleware, isNotLoginRedirct, moveToCart);
router.get('/wallet',nocache(), authMiddleware, isNotLoginRedirct, getWallet);
router.post('/wallet/add-wallet-money',nocache(), authMiddleware, isNotLoginRedirct, addToWallet);
router.post('/wallet/redeem-wallet-money',nocache(), authMiddleware, isNotLoginRedirct, redeemFromWallet);
router.get('/profile/reviews',nocache(), authMiddleware, isNotLoginRedirct, getReviewsPage);
router.post('/reviews/add-review',nocache(), authMiddleware, isNotLoginRedirct, removeEmptyStrings, addNewReview );
router.get('/brand',nocache(), authMiddleware, isUser, getBrand);
router.get('/filters',nocache(), authMiddleware, isUser, filterProducts);
router.get('/checkconfirm',nocache(), getOrderConfirmation);
router.get('/select', nocache(), authMiddleware, isUser, selectMenu);
router.get('/search', nocache(), authMiddleware, isUser, searchText);
router.post('/forgotPassword', nocache(), authMiddleware, isUser, forgotPassword);
router.get('/reset-password/:token', nocache(), authMiddleware, isUser, resetPassword);
router.post('/change-password', nocache(), authMiddleware, isUser, changePassword);
router.post('/change-old-password', nocache(), authMiddleware, isNotLoginRedirct, changeOldPassword)


module.exports = router;