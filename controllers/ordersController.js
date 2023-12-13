const asyncHandler = require('express-async-handler');
const Orders = require('../models/ordersModel');
const Cart = require('../models/cartModel');
const CartItem = require('../models/cartItemModel');
const { generateOrderId, cartQty, getAllBrands, invoiceHtml } = require('../helperfns');
const CryptoJS = require('crypto-js');
const Razorpay = require('razorpay');
const puppeteer = require('puppeteer');


//Display Orders in admin side
const getOrders = asyncHandler( async (req,res) => {
    const orders = await Orders.find().sort({ createdAt: -1 })
    .populate('shippingAddress').populate('user').lean();
    res.render('admin/orders',{admin:true,adminInfo:req.user,orders});
});

//Display Orders in user side
const getOrdersPage = asyncHandler( async(req,res) => {
    try {
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
            const orderDateYears = req.query.orderDate.map(year => parseInt(year));
            console.log(orderDateYears)
            matchCondition.$expr =  { $in: [ { $year: { date: '$createdAt'} },orderDateYears]}
        }

        console.log(matchCondition)

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
        page, Brands, endPage, totalOrders: orderCount,
        fromOrder, toOrder, pageSize, orderBy, orderDate, orderStatus,
        bodycss:'/css/myprofile.css',bodyjs:'/js/myprofile.js'});
    } catch (error) {
         console.log(error);
         res.status(500).json({error: error})
    }
});


//Order details in user side
const getOrdersDetails = asyncHandler( async (req,res) => {
    try {
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
            console.log(index)
            res.render('users/orderDetails',{user,totalQty,order,Brands,
                bodycss:'/css/myprofile.css',bodyjs:'/js/myprofile.js'});
        } 
        else res.status(404).json({ error: 'Order not found' });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

//Order details in admin side
const orderDetails = asyncHandler( async (req,res) => {
    try {
        const { order_id }  = req.query;
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
        res.render('admin/orderDetails',{admin:true,adminInfo:req.user,orderdetails});
    } catch (error) {
        console.log(error)
    }
});
    

const createOrders = asyncHandler(async (req, res) => {
    try {
        let paymentMethod = req.body.paymentMethod;
        const cart = await Cart.findOne({ user: req.user?._id });
        const orderItems = []; // Array to store the order items
        let totalPrice = 0;
        
        for (const item of cart.items) {
          const cartitem = await CartItem.findById(item.cartItem).populate('product');
          const itemTotalPrice = cartitem.product.price * item.quantity;
          
          orderItems.push({
              item: cartitem.id,
              quantity: item.quantity,
              price: itemTotalPrice,
          });
          totalPrice += itemTotalPrice;
        }
        
        if (req.body.shippingMethod === 'Fast delivery') {
            totalPrice +=25;
        }
    
        req.body.user = req.user;
        req.body.orderItems = orderItems;
        req.body.totalPrice = totalPrice;
        req.body.GrandTotal = totalPrice + cart.deliveryCharge;
        req.body.delivery =  cart.deliveryCharge;
        req.body.orderId = generateOrderId();

        let order,razorpayOrderData;  ;
        
        if (paymentMethod === 'Razorpay') {
            const options = {
                amount: req.body.GrandTotal * 100,
                currency: 'INR',
            };
           
            const razorpayInstance = new Razorpay({
                key_id: process.env.RAZOR_KEY_ID ,
                key_secret: process.env.RAZOR_KEY_SECRET,
            }); 
        
            req.body.paymentStatus = 'Pending';
            razorpayOrderData = await razorpayInstance.orders.create(options);     
            order = await Orders.create({ ...req.body,paymentInfo:razorpayOrderData});
        } else {
            order = await Orders.create(req.body);
            cart.items = [];
            await cart.save();
        }

        const user = req.user, totalQty = await cartQty(user);
        console.log({ razorpayOrderData },"wekmmkmgdrk")
        if (order) {
            if (paymentMethod === 'Razorpay') res.json({ razorpayOrderData })
            else res.render('users/orderConfirmation', { user, totalQty });  
        } else res.status(500).json({ error: 'Failed to create order' });
        
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
});


const razorpayPayment = asyncHandler( async(req,res) => {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;
    try {
        const cart = await Cart.findOne({ user: req.user?._id });
        // Verify the payment signature (using your key secret)
        const generatedSignature = CryptoJS.HmacSHA256(`${razorpay_order_id}|${razorpay_payment_id}`, 
            process.env.RAZOR_KEY_SECRET).toString();

        if (generatedSignature === razorpay_signature) {
             const order = await Orders.findOneAndUpdate({ 'paymentInfo.id': razorpay_order_id }, {
                $set: {
                    paymentStatus: 'Paid', 
                },
            });

            if (order) {
                cart.items = [];
                await cart.save();
                res.render('users/orderConfirmation');
            } else {
                res.status(404).json({ error: error });
            }
        } else {
           console.log('Payment failed!');
           res.status(404).json({erro: "something is wrong"});
        }   
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
   
});



const changeOrderStatus = asyncHandler(async(req,res) => {
    try {
        const { orderId, action } = req.query;
        let status, paymentStatus;

        if(action == 'restore'){
            status = "Pending";
            paymentStatus = "Pending";
        } else if(action == 'shipped') {
            status = "Shipped";
        } else if(action == 'delivered') {
            status = "Delivered";
            paymentStatus = "Paid";
        } else if(action == 'cancel') {
            status = "Cancelled";
            const order = await Orders.findOne({ orderId });
            if(order.paymentStatus == "Paid") paymentStatus = "Refund";
            else paymentStatus = "Cancelled";
        }
        
        await Orders.updateOne({orderId},{status, paymentStatus});
        return res.redirect('/admin/orders')
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


const generateInvoice = asyncHandler(async (req, res) => {
    try {
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
        const pdfBuffer = await page.pdf({ format: 'A4'});
        await browser.close();

        // Set the response headers for PDF download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=invoice.pdf');
        res.send(pdfBuffer);
    } catch (error) {
        console.error('Error generating invoice:', error);
        res.status(500).send('Internal Server Error');
    }
});

  
module.exports = { getOrders, orderDetails,
     createOrders, getOrdersPage, getOrdersDetails,
     razorpayPayment, changeOrderStatus, generateInvoice
     }