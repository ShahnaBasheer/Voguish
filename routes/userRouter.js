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
const { filterProducts } = require('../controllers/filterController');
const { getWallet, addToWallet, redeemFromWallet } = require('../controllers/walletController');
const { getReviewsPage, addNewReview } = require('../controllers/reviewsController');
const { authMiddleware, isUser, isUserLoggedIn} = require('../middlewares/authMiddlewares');
const { removeEmptyStrings, limiter } = require('../middlewares/otherMiddlewares');
const router = express.Router();




router.get('/', authMiddleware, isUser, getHomePage);
router.get('/home', authMiddleware, isUser, getHomePage);
router.get('/login', authMiddleware,isUserLoggedIn, getLoginPage);
router.post('/login', authMiddleware, isUserLoggedIn, loginUser);
router.get('/signup', getSignupPage);
router.post('/signup', authMiddleware, isUser, createUser);
router.get('/logout', authMiddleware, isUser, logout);
router.get('/check-email', emailCheck);
router.get('/check-phone', phoneCheck);
router.post('/otp-verification', otpVerification);
router.get('/otp-verification', otpVerify);
router.post('/resend-otp', limiter, resendOtpCode);
router.get('/women', authMiddleware, isUser, getWomenPage);
router.get('/men', authMiddleware, isUser, getMenPage);
router.get('/kids', authMiddleware, isUser, getKidsPage);
router.get('/girls', isUser, getGirlsPage);
router.get('/boys', authMiddleware, isUser, getBoysPage);
router.get('/product/:slug', authMiddleware, isUser, getProduct);
router.get('/account-blocked', authMiddleware, isUser, getBlocked);
router.get('/cart', authMiddleware, isUser, getCartPage);
router.get('/cart/addtocart/:slug', authMiddleware, isUser, addToCart);
router.get('/cart/check-size-color/:slug', authMiddleware, isUser, checkSize);
router.get('/cart/cart-item-remove/:id', authMiddleware, isUser, removeCartItem);
router.get('/cart/qty-plus/:id', authMiddleware, isUser, quantityPlus);
router.get('/cart/qty-minus/:id', authMiddleware, isUser, quantityMinus);
router.get('/checkout', authMiddleware, isUser, getCheckoutPage);
router.post('/checkout/orders/', authMiddleware, isUser, removeEmptyStrings, createOrders);
router.post('/checkout/apply-coupon', authMiddleware , isUser, applyCoupon);
router.get('/orders', authMiddleware, isUser, getOrdersPage);
router.get('/orders/order-details', authMiddleware, isUser, getOrdersDetails);
router.get('/orders/generate-invoice', authMiddleware, isUser, generateInvoice)
router.post('/razorpay/order-payment', authMiddleware, isUser, razorpayPayment);
router.get('/contact', authMiddleware, isUser, getContactPage);
router.get('/profile', authMiddleware, isUser, getProfilePage);
router.get('/profile/address', authMiddleware, isUser, getAddressPage);
router.post('/profile/edit', authMiddleware, isUser, editProfile);
router.post('/profile/add-address', authMiddleware, isUser, removeEmptyStrings, addNewAddress);
router.post('/profile/edit-address', authMiddleware, isUser, removeEmptyStrings, editAddress);
router.delete('/profile/delete-address/:id', authMiddleware, isUser, deleteAddress);
router.post('/profile/default-address', authMiddleware, isUser, removeEmptyStrings, defaultAddress);
router.get('/wishlist', authMiddleware, isUser, getWishList);
router.get('/wishlist/add-to-wishlist/:slug', authMiddleware, isUser, addToWishList)
router.get('/wishList/delete-item/:slug', authMiddleware, isUser, deleteWishList);
router.get('/wishList/moveToCart/:slug', authMiddleware, isUser, moveToCart);
router.get('/wallet', authMiddleware, isUser, getWallet);
router.post('/wallet/add-wallet-money', authMiddleware, isUser, addToWallet);
router.post('/wallet/redeem-wallet-money', authMiddleware, isUser, redeemFromWallet);
router.get('/profile/reviews', authMiddleware, isUser, getReviewsPage);
router.post('/reviews/add-review', authMiddleware, isUser, removeEmptyStrings, addNewReview );
router.get('/brand', authMiddleware, isUser, getBrand);
router.get('/filters', authMiddleware, isUser, filterProducts);
router.get('/checkconfirm', getOrderConfirmation);




module.exports = router;