const express = require('express');
const { getAllUsers, getUser, deleteUser,
        updateUser, blockUser, unblockUser,
        adminLogin, adminLogout, restoreUser } = require('../controllers/userController');
const { addProduct, getProduct, getAllProducts,
        getAddProduct, deleteProduct, editProduct,
        getEditProduct, restoreProduct } = require('../controllers/productController');
const { getDashboard, getAdminLogin} = require('../controllers/pageController');
const { getAllBrands, getAddBrand, addBrand,
        editBrand, deleteBrand, getEditBrand,
        restoreBrand } = require('../controllers/brandController');
const { getAllCategories, getAddCategory, addCategory,
        editCategory, deleteCategory, getEditCategory,
        restoreCategory } = require('../controllers/categoryContoller');
const { getCartList } = require('../controllers/cartController');
const { getCoupons, addCoupons, fetchCoupon,
        editCoupon, restoreCoupon, deleteCoupon } = require('../controllers/couponsController');
const { getOrders, orderDetails, changeOrderStatus, 
        generateSalesReport } = require('../controllers/ordersController');
const { adminAuth, isAdmin, isAdminLoggedIn } = require('../middlewares/authMiddlewares');
const { removeEmptyStrings } = require('../middlewares/otherMiddlewares');
const { upload, processImages } = require('../config/multerConfig');
const router = express.Router();
const nocache = require('nocache');


router.get('/', nocache(), adminAuth, isAdminLoggedIn, getAdminLogin);
router.post('/login', nocache(), adminAuth, isAdminLoggedIn, adminLogin);
router.get('/dashboard', nocache(), adminAuth, isAdmin, getDashboard);
router.get('/users', nocache(), adminAuth, isAdmin, getAllUsers);
router.get('/delete-user/:id', nocache(), adminAuth, isAdmin, deleteUser);
router.get('/restore-user/:id', nocache(), adminAuth, isAdmin, restoreUser)
router.put('/edit-user', nocache(), adminAuth, isAdmin, updateUser);
router.get('/block-user/:id', nocache(), adminAuth, isAdmin,  blockUser);
router.get('/unblock-user/:id', nocache(), adminAuth, isAdmin, unblockUser);
router.get('/view-products', nocache(), adminAuth, isAdmin, getAllProducts);
router.get('/add-product', nocache(), adminAuth, isAdmin, getAddProduct);
router.post('/add-product', nocache(), adminAuth, isAdmin, upload, processImages, removeEmptyStrings , addProduct);
router.get('/delete-product/:id', nocache(), adminAuth, isAdmin, deleteProduct);
router.get('/restore-product/:slug', nocache(), adminAuth, isAdmin, restoreProduct);
router.get('/edit-product/:slug', nocache(), adminAuth, isAdmin, getEditProduct);
router.patch('/edit-product', nocache(), adminAuth, isAdmin, upload, processImages, editProduct);
router.get('/categories', nocache(), adminAuth, isAdmin, getAllCategories);
router.get('/add-category', nocache(), adminAuth, isAdmin,  getAddCategory);
router.post('/add-category', nocache(), adminAuth, isAdmin,  removeEmptyStrings, addCategory);
router.get('/edit-category/:id', nocache(), adminAuth, isAdmin, getEditCategory);
router.post('/edit-category', nocache(), adminAuth, isAdmin,  removeEmptyStrings, editCategory);
router.get('/delete-category/:id', nocache(), adminAuth, isAdmin,  deleteCategory);
router.get('/restore-category/:id', nocache(), adminAuth, isAdmin, restoreCategory);
router.get('/brands', nocache(), adminAuth, isAdmin,  getAllBrands);
router.get('/add-brand', nocache(), adminAuth, isAdmin,  getAddBrand);
router.post('/add-brand', nocache(), adminAuth, isAdmin,  removeEmptyStrings, addBrand);
router.get('/edit-brand/:id', nocache(), adminAuth, isAdmin,  getEditBrand);
router.post('/edit-brand', nocache(), adminAuth, isAdmin,  removeEmptyStrings, editBrand);
router.get('/delete-brand/:id', nocache(), adminAuth, isAdmin,  deleteBrand);
router.get('/restore-brand/:id', nocache(), adminAuth, isAdmin, restoreBrand);
router.get('/view-cartlist', nocache(), adminAuth, isAdmin, getCartList);
router.get('/orders', nocache(), adminAuth, isAdmin, getOrders);
router.get('/order-details', nocache(), adminAuth, isAdmin, orderDetails);
router.get('/change-order-status/', nocache(), adminAuth, isAdmin, changeOrderStatus);
router.post('/dashboard/generate-sales-report', nocache(), adminAuth, isAdmin, generateSalesReport);
router.get('/coupons', nocache(), adminAuth, isAdmin, getCoupons);
router.post('/add-coupon', nocache(), adminAuth, isAdmin, addCoupons);
router.get('/fetch-coupon', nocache(), adminAuth, isAdmin, fetchCoupon);
router.patch('/edit-coupon', nocache(), adminAuth, isAdmin, removeEmptyStrings, editCoupon);
router.get('/restore-coupon/:id', nocache(), adminAuth, isAdmin, restoreCoupon);
router.get('/delete-coupon/:id', nocache(), adminAuth, isAdmin, deleteCoupon)
;router.get('/logout', nocache(), adminAuth, isAdmin, adminLogout);



module.exports = router;