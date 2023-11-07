const asyncHandler = require('express-async-handler');
const Orders = require('../models/ordersModel');
const Cart = require('../models/cartModel');
const User = require('../models/userModel');
const CartItem = require('../models/cartItemModel');
const {  generateOrderId, cartQty } = require('../helperfns');
const Order = require('../models/ordersModel');


//Display Orders
const getOrders = asyncHandler( async (req,res) => {
    const orders = await Orders.find().populate('shippingAddress').lean();
    res.render('admin/orders',{admin:true,adminInfo:req.user,orders});
});

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
    
        // Create the order
        req.body.user = req.user;
        req.body.orderItems = orderItems;
        req.body.totalPrice = totalPrice;
        req.body.GrandTotal = totalPrice + cart.deliveryCharge;
        req.body.delivery =  cart.deliveryCharge;
        req.body.orderId = generateOrderId();
        let order = await Orders.create(req.body);
        // Remove items from the cart
        cart.items = [];
        await cart.save();
        const user = req.user, totalQty = await cartQty(user);
        if (order){
            res.render('users/orderConfirmation', { user, totalQty});
        }
        else res.status(500).json({ error: 'Failed to create order' });

    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
});

const cancelOrder = asyncHandler( async(req,res) => {
    try {
        const { orderId } = req.params;
        await Order.updateOne({orderId:orderId},{status:"cancelled"});
        return res.redirect('/admin/orders')

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

const restoreOrder = asyncHandler(async(req,res) => {
    try {
        const { orderId } = req.params;
        await Order.updateOne({orderId:orderId},{status:"Processing"});
        return res.redirect('/admin/orders')
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

  
module.exports = { getOrders, orderDetails,
     createOrders, cancelOrder,
     restoreOrder }