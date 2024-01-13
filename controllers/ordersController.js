const asyncHandler = require('express-async-handler');
const Orders = require('../models/ordersModel');
const Cart = require('../models/cartModel');
const User = require('../models/userModel');
const Product = require('../models/productModel');
const CartItem = require('../models/cartItemModel');
const Wallet = require('../models/walletModel');
const Coupon = require('../models/couponModel');
const { generateOrderId, cartQty, getAllBrands,
    calculateDiscount, invoiceHtml, findCart,
    salesReportGenerator } = require('../helperfns');
const CryptoJS = require('crypto-js');
const Razorpay = require('razorpay');
const puppeteer = require('puppeteer');
const Order = require('../models/ordersModel');


//Display Orders in admin side
const getOrders = asyncHandler( async (req,res) => {
    const orders = await Orders.find().sort({ createdAt: -1 })
            .populate('shippingAddress').populate('user').lean();
    res.render('admin/orders',{admin:true,adminInfo:req.user,orders,__active: 'orders'});
    
});

//Display Orders in user side
const getOrdersPage = asyncHandler( async(req,res) => {
    const Brands = await getAllBrands(); 
    const user = req.user, totalQty = await cartQty(user),
          page = parseInt(req?.query?.page) || 1,
          pageSize = parseInt(req?.query?.pageSize) || 10,
          orderBy = parseInt(req?.query?.orderBy) || -1;
          skipPage = (page - 1) * pageSize,
          orderDate =  req?.query?.orderDate,
          orderStatus =  req?.query?.orderStatus;
    
    let matchCondition = { user: user?._id };

    // Check if orderstatus is provided in the query
    if(req?.query?.orderStatus){ 
        matchCondition.status = { $in: orderStatus } 
    }
    if(req?.query?.orderDate){
        const orderDateYears = req?.query?.orderDate?.map(year => parseInt(year));
        matchCondition.$expr =  { $in: [ { $year: { date: '$createdAt'} },orderDateYears]}
    }

    const myordersCount = await Orders.aggregate([
        { $match: matchCondition },
        { $unwind: "$orderItems" },
        { $count: "total"}
    ]);
    
    const orderCount = myordersCount[0]?.total;
    const totalPages = Math.ceil( orderCount / pageSize);
    const startPage = Math.max(1, (page+1) - Math.ceil(pageSize / 2));
    const endPage = Math.min(totalPages, startPage + pageSize - 1);
    const paginationLinks = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);

    const myorders = await Orders.aggregate([
        { $match: matchCondition },
        { $unwind: "$orderItems" },
        {
            $lookup: {
                from: "cartitems",
                localField: "orderItems.item",
                foreignField: "_id",
                as: "orderItems.cartItem"
            }
        },
        { $unwind: "$orderItems.cartItem" },
        {
            $lookup: {
                from: "products",
                localField: "orderItems.cartItem.product",
                foreignField: "_id",
                as: "orderItems.cartItem.product"
            }
        },
        { $unwind: "$orderItems.cartItem.product" },
        { $sort: { "createdAt": orderBy } },
        { $skip: skipPage },
        { $limit: pageSize },
        {
            $project: {
                _id: 0,
                user: "$user",
                orderId: "$orderId",
                product: "$orderItems.cartItem.product",
                item: "$orderItems.cartItem._id",
                size: "$orderItems.cartItem.size",
                color: "$orderItems.cartItem.color",
                quantity: "$orderItems.quantity",
                price: "$orderItems.price",
                totalPrice: "$totalPrice",
                shippingAddress: "$shippingAddress",
                shippingMethod: "$shippingMethod",
                status: "$status",
                paymentMethod: "$paymentMethod",
                delivery: "$delivery",
                GrandTotal: "$GrandTotal",
                paymentStatus: "$paymentStatus",
                paymentInfo: "$paymentInfo",
                createdAt: "$createdAt"
            }
        }
    ]);
    let fromOrder = skipPage + 1;
    let toOrder = fromOrder + pageSize - 1;
    if(toOrder > orderCount) toOrder = orderCount;
       
    res.render('users/ordersInfo',{user,totalQty,myorders,paginationLinks,
        page, Brands, endPage, totalOrders: orderCount, tab: "orders",
        fromOrder, toOrder, pageSize, orderBy, orderDate, orderStatus,
        bodycss:'/css/myprofile.css',bodyjs:'/js/myprofile.js'});
});


//Order details in user side
const getOrdersDetails = asyncHandler( async (req,res) => {
    const { orderId, proItem } = req?.query;
    const Brands = await getAllBrands(); 
    const user = req.user, totalQty = await cartQty(user);
    const order = await Orders.findOne({orderId,user:req?.user?._id})
        .populate('shippingAddress')
        .populate({
            path: 'orderItems.item',
            populate: {
              path: 'product',
              model: 'Product'
            }
    }).lean();
    
      
    if(order){
        let index = order?.orderItems.findIndex(pro => pro.item._id.toString() === proItem);
        order.index = index;
        res.render('users/orderDetails',{user,totalQty,order,Brands,
            bodycss:'/css/myprofile.css',bodyjs:'/js/myprofile.js'});
    } 
    else res.status(404).json({ error: 'Order not found' });
})

//Order details in admin side
const orderDetails = asyncHandler( async (req,res) => {
    const { order_id }  = req?.query;
    const orderdetails = await Orders.findOne({ orderId: order_id })
        .populate('user')
        .populate({
            path: 'orderItems.item',
            model: 'CartItem',
            populate: {
                path: 'product',
                model: 'Product'
            }
        })
        .populate('shippingAddress')
        .lean();
    res.render('admin/orderDetails',{admin:true,adminInfo:req?.user,orderdetails});
});


const createOrders = asyncHandler(async (req, res) => {
    const paymentMethod = req?.body?.paymentMethod;
    const user = req?.user, totalQty = await cartQty(user);
    const cart = await Cart.findOne({ user: user?._id });
    const wallet = await Wallet.findOne({ user: user?.id });
    const orderItems = [];
    let totalPrice = shippingCharge = couponRedeemed = 0;
    let newOrder, razorpayOrderData;
    const coupon = await Coupon.findOne({ code: req?.body?.couponcode });
        
    for (const item of cart?.items) {
        const cartItem = await CartItem.findById(item.cartItem).populate('product');
        const itemTotalPrice = cartItem?.product?.price * item?.quantity;
        orderItems.push({
            item: cartItem?.id,
            quantity: item?.quantity,
            price: itemTotalPrice,
        });
        totalPrice += itemTotalPrice;
    }

    if (coupon) {
        couponRedeemed = await calculateDiscount(coupon, totalPrice, res);
        req.body.couponApplied = coupon;
        req.body.couponPrice = couponRedeemed;
    }

    if (req?.body?.shippingMethod === 'FastDelivery') {
        shippingCharge = 25;
        req.body.shippingCharge = shippingCharge;
    }

    let GrandTotal = totalPrice + cart?.deliveryCharge + shippingCharge - couponRedeemed;
    let redeemAmount = 0;
    req.body.GrandTotal = GrandTotal;

    if(req?.body?.wallet){
        redeemAmount = Math.min(GrandTotal, wallet?.balance);
        req.body.walletPayment = redeemAmount;
        req.body.paymentMethod = 'Wallet';
        GrandTotal -= redeemAmount;
    }

    req.body.user = user;
    req.body.orderItems = orderItems;
    req.body.totalPrice = totalPrice;
    req.body.delivery = cart?.deliveryCharge;
    req.body.orderId = generateOrderId();


    if (paymentMethod === 'Razorpay') {
        const options = {
            amount: GrandTotal * 100,
            currency: 'INR',
        };

        const razorpayInstance = new Razorpay({
            key_id: process.env.RAZOR_KEY_ID,
            key_secret: process.env.RAZOR_KEY_SECRET,
        });
        
        req.body.paymentStatus = 'Pending';
        req.body.paymentMethod = 'Razorpay';
        razorpayOrderData = await razorpayInstance.orders.create(options);
        razorpayOrderData.amount_paid = GrandTotal;
        req.body.paymentInfo = razorpayOrderData;
    }
        
    newOrder = await Orders.create(req.body);

    const order = await Orders.findById(newOrder.id)
        .populate('shippingAddress')
        .populate({
            path: 'orderItems.item',
            model: 'CartItem',
            populate: {
                path: 'product',
                model: 'Product'
            }
    }).lean();

    
        
    if (newOrder) {
        if (paymentMethod === 'Razorpay') {
            res.json({ razorpayOrderData });
        } else {
            req.body.paymentMethod = 'CashOnDelivery';

            if(wallet && req?.body?.wallet){
                wallet.balance -= redeemAmount;
                wallet?.transactionHistory.unshift({
                    type: 'debit',
                    amount: redeemAmount,
                    method: 'purchase_debit',
                    transactionInfo: {
                        orderId : order._id
                    },
                });
                await wallet?.save();
            }
            cart.items = [];
            await cart?.save();

            if(req?.body?.couponcode && coupon){
                coupon.timesUsed++;
                await coupon?.save();
            }
          
            // Update product stock here
            for (const item of orderItems) {
                const cartItem = await CartItem.findById(item.item);
                const product = await Product.findById(cartItem.product);
            
                if (product) {
                    const sizeInfo = product.sizes.get(cartItem.size);
            
                    if (sizeInfo) {
                        const colorInfo = sizeInfo.find(entry => entry.color === cartItem.color);            
                        if (colorInfo) {
                            colorInfo.stock = Math.max(colorInfo.stock - item.quantity, 0);
                        }
                    }
            
                    product.totalStock -= item.quantity;
                    await product.save();
                }
            }
            res.render('users/orderConfirmation', { user, totalQty , order});
        }
    } else {
        res.status(500).json({ error: 'Failed to create order' });
    }
});



const razorpayPayment = asyncHandler(async (req, res) => {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req?.body;

    const user = await User.findById(req?.user?._id).populate('addresses').lean();
    const totalQty = await cartQty(user);
    const cart = await Cart.findOne({ user: req.user?._id });
    const Myorder = await Orders.findOne({ 'paymentInfo.id': razorpay_order_id});
    const order = await Orders.findOne({ 'paymentInfo.id': razorpay_order_id})
        .populate('shippingAddress')
        .populate({
            path: 'orderItems.item',
            model: 'CartItem',
            populate: {
                path: 'product',
                model: 'Product'
            }
    }).lean();

    // Verify the payment signature
    const generatedSignature = CryptoJS.HmacSHA256(`${razorpay_order_id}|${razorpay_payment_id}`, 
        process.env.RAZOR_KEY_SECRET).toString();

    if (generatedSignature === razorpay_signature) {
        Myorder.paymentStatus = 'Paid';
        await Myorder.save();

        if (Myorder) {

            cart.items = [];
            
            if(Myorder?.couponApplied){
                const coupon = await Coupon.findById(Myorder?.couponApplied);

                if (coupon && coupon.endDate >= new Date() && coupon.status === 'Active' && coupon.startDate <= new Date()) {
                    coupon.timesUsed++;
                    await coupon.save();
                } else {
                    console.error('Coupon is expired or not valid.');
                    throw new Error('Coupon Expired or Cancelled!');
                }
            }
            
            

            if(Myorder.walletPayment > 0){
                const wallet = await Wallet.findOne({ user: req?.user?.id });

                if(wallet){
                    wallet.balance = wallet.balance - Myorder.walletPayment;
                    wallet.transactionHistory.unshift({
                        type: 'debit',
                        amount: Myorder.walletPayment,
                        method: 'purchase_debit',
                        transactionInfo: {
                            orderId : Myorder._id
                        },
                    })
                    await wallet?.save();
                } else {
                    throw new Error('Something has Happend with the wallet');
                }
               
            }

            // Update product stock here
            for (const item of Myorder.orderItems) {
                const cartItem = await CartItem.findById(item.item);
                const product = await Product.findById(cartItem.product);

                if (product) {
                    const sizeInfo = product.sizes.get(cartItem.size);

                    if (sizeInfo) {
                        const colorInfo = sizeInfo.find(entry => entry.color === cartItem.color);
                        if (colorInfo) {
                            colorInfo.stock = Math.max(colorInfo.stock - item.quantity, 0);
                        }
                    }

                    product.totalStock -= item.quantity;
                    await product.save();
                }
            }

            await cart?.save();

            res.render('users/orderConfirmation', {order, user, totalQty});
        } else {
            res.status(404).json({ error: 'Order not found' });
        }
    } else {
        order.paymentStatus = 'Failed';
        order.status = 'Failed';
        console.log('Payment failed!');
        res.status(400).json({ error: 'Invalid signature' });
    }
});



const changeOrderStatus = asyncHandler(async (req, res) => {
    const { orderId, action } = req.query;
    let status, paymentStatus;
    
    switch (action) {
      case 'restore':
        status = 'Pending';
        paymentStatus = 'Pending';
        break;
      case 'shipped':
        status = 'Shipped';
        break;
      case 'delivered':
        status = 'Delivered';
        paymentStatus = 'Paid';
        break;
      case 'cancel':
        status = 'Cancelled';
        const order = await Orders.findOne({ orderId });
        paymentStatus = order?.paymentStatus === 'Paid' ? 'Refund' : 'Cancelled';
        break;
      default:
        // Handle the default case if needed
    }
    
    await Orders.findOneAndUpdate({ orderId }, { status, paymentStatus });
    return res.redirect('/admin/orders');
  });
  
  
//generate invoice for user side
const generateInvoice = asyncHandler(async (req, res) => {

    const { orderId, _idx } = req?.query;
    const orderData = await Orders.findOne(
        {orderId,user:req?.user?._id})
        .populate('shippingAddress')
        .populate({
            path: 'orderItems.item',
            populate: {
              path: 'product',
              model: 'Product'
            }
      }).lean();

    const htmlContent = await invoiceHtml(orderData,_idx)

    // Launch a headless browser using Puppeteer with the 'new' headless mode
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    // Set the HTML content of the page
    await page.setContent(htmlContent);
    
    // Generate a PDF file from the HTML content
    const pdfBuffer = await page.pdf({
         format: 'A4',
         margin: {
            top: '30px',
            right: '30px',
            bottom: '30px',
            left: '30px',
        },
        });
    await browser.close();

    // Set the response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=invoice.pdf');
    res.send(pdfBuffer);
});



// generate sales report in the admin side
const generateSalesReport = asyncHandler( async(req, res) => {
    const { startDate, endDate } = req?.body;
    let totalGrandTotal = 0;

    const allorders = await Orders.find({
        createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }})
        .populate('user')
        .populate({
            path: 'orderItems.item',
            populate: {
              path: 'product',
              model: 'Product'
        }
    }).lean();

       
    allorders.forEach(order => {
        totalGrandTotal += order?.GrandTotal || 0;
    });
    totalGrandTotal = totalGrandTotal?.toLocaleString('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });
    
    const htmlContent = await salesReportGenerator(allorders,totalGrandTotal,startDate,endDate)

    // Launch a headless browser using Puppeteer with the 'new' headless mode
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    // Set the HTML content of the page
    await page.setContent(htmlContent);
      
    // Generate a PDF file from the HTML content
    const pdfBuffer = await page.pdf({
         format: 'A4',
         margin: {
            top: '30px',
            right: '30px',
            bottom: '30px',
            left: '30px',
        },
        });
    await browser.close();

    // Set the response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=sales_report.pdf');
    res.send(pdfBuffer);

});

 

//get Contact page 
const getCheckoutPage = asyncHandler( async (req,res) => {
    const user = await User.findById(req?.user?.id)
           .populate('addresses').populate('defaultAddress').lean();
        cartDetails = await findCart(user),
        Brands = await getAllBrands(),
        totalQty = await cartQty(user),
        wallet = await Wallet.findOne({ user }).lean();

    res.render('users/checkout',{user,cartDetails,totalQty,wallet,Brands,
        bodycss:'/css/checkout.css',bodyjs:'/js/checkout.js'});      
});


const orderReturn = asyncHandler(async( req,res) => {
    /*const { orderId, _idx } = req?.query;
    const orderData = await Orders.findOne(
        {orderId,user:req?.user?._id})
        .populate('shippingAddress')
        .populate({
            path: 'orderItems.item',
            populate: {
              path: 'product',
              model: 'Product'
            }
    }).lean();*/
});
  

const orderCancel = asyncHandler(async( req, res) => {
    const { orderId, proItem } = req?.query;
    
    const order = await Orders.findOne({ orderId });
    let paymentStatus = order?.paymentStatus === 'Paid' ? 'Refund' : 'Cancelled';

    if(order){
        order.status = 'Cancelled';
        if(order.paymentStatus == "Paid"){
            order.paymentStatus = "Refund";
        } else if(order.paymentStatus == "Pending"){
            order.paymentStatus = "Cancelled";
        }
        await order.save();
        res.redirect(`/orders/order-details?orderId=${orderId}&proItem=${proItem}&message=${encodeURIComponent('You are not Authorized to access this page!')}`)
    }
     
})


module.exports = { getOrders, orderDetails,
     createOrders, getOrdersPage, getOrdersDetails,
     razorpayPayment, changeOrderStatus, generateInvoice,
     getCheckoutPage,  generateSalesReport, orderCancel
     }