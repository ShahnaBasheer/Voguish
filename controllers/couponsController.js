const asyncHandler = require('express-async-handler');
const Coupon = require('../models/couponModel');
const { calculateDiscount, findCart } = require('../helperfns')


const getCoupons = asyncHandler(async (req, res) => {
    const coupons = await Coupon.find().lean();
    res.render('admin/coupons',{admin:true,adminInfo:req?.user,coupons,__active: 'coupons'});
});


const fetchCoupon = asyncHandler(async (req, res) => {
    try{
        const { couponId } = req.query;
        const coupon = await Coupon.findById(couponId).lean();
        res.status(200).json(coupon);
    } catch(error) {
        console.log(error)
        res.status(500).json({statusText:error.message});
    }
});


const editCoupon = asyncHandler( async(req, res) => {
    try {
        
        const coupon = await Coupon.findByIdAndUpdate(req?.body?.id, req?.body);
        if(coupon){
            await coupon.save();
            res.status(200).json({message: 'Coupon Updated Successfully!'});
        }else{
            res.status(404).json({message: 'Failed to update coupon!'});
        } 
    } catch (error) {
        res.status(500).json({message: error.message})
    }

});


const addCoupons = asyncHandler(async (req, res) => {
    const { couponTitle,code,startDate,endDate,discount,
            maxDiscountAmount,minPurchaseAmount,status,isForAllUsers,
            targetUserGroups,usageLimit } = req?.body;

    // Create a new coupon object
    const existCouponCode = await Coupon.findOne({code}).exec();
     
    if(!existCouponCode) {
        const newCoupon = new Coupon({couponTitle,code,
          startDate,endDate,discount,maxDiscountAmount,
          minPurchaseAmount,status,isForAllUsers,
          targetUserGroups,usageLimit
        });

        if(newCoupon){
          await newCoupon?.save();
          console.log('Coupon added successfully')
          res.redirect('/admin/coupons')
       }else{
          res.status(500).json({ error: 'newCoupons not valid' });
       }
    }else{
        res.status(500).json({ error: 'CouponCode Already Exist' });
    }

});


const restoreCoupon = asyncHandler( async (req, res) => {
    const { id }  = req?.params;
    const coupon = await Coupon.findByIdAndUpdate(id,{isDeleted:false});
    res.redirect('/admin/coupons');
});

const deleteCoupon = asyncHandler( async (req, res) => {
    const coupon = await Coupon.findByIdAndUpdate(id,{isDeleted:true});
    res.redirect('/admin/coupons');
});


const applyCoupon = asyncHandler(async (req, res) => {
    const { couponCode } = req.body;
    const cart = await findCart(req?.user); 

    if(!cart){
        res.status(500).json({ success: false, message: 'Something went wrong with the cart!' });
    }

    // Find the coupon based on the provided code
    const coupon = await Coupon.findOne({ code: couponCode });

    if (coupon?.status === 'Active') {
        const discountAmount = await calculateDiscount(coupon, Number(cart?.totalPrice), res);
        if (discountAmount){
            res.status(200).json({ success: true, discAmt:discountAmount, coupon });
        } else {
            res.status(400).json({ success: false, message: 'Coupon is not applicable to this purchase.' });
        }
    } else if (coupon?.status === 'Expired') {
        res.status(400).json({ success: false, message: 'Coupon is expired.' });
    } else {
        res.status(404).json({ success: false, message: 'Invalid or inactive coupon code.' });
    }
});



module.exports = { getCoupons, fetchCoupon, 
    applyCoupon, addCoupons, editCoupon,
    restoreCoupon, deleteCoupon }