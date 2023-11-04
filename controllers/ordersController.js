const asyncHandler = require('express-async-handler');
const Orders = require('../models/ordersModel');
const Cart = require('../models/cartModel');
const User = require('../models/userModel');
const CartItem = require('../models/cartItemModel');
const {  generateOrderId } = require('../helperfns');

//Display Orders
const getOrders = asyncHandler( async (req,res) => {
    const orders = await Orders.find().populate('shippingAddress').lean();
    res.render('admin/orders',{admin:true,adminInfo:req.user,orders});
});

const orderDetails = asyncHandler( async (req,res) => {
    try {
        const { order_id }  = req.query;
        console.log(order_id,"juhdj")
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
           console.log(orderdetails)
        res.render('admin/orderDetails',{admin:true,adminInfo:req.user,orderdetails});
    } catch (error) {
        console.log(error)
    }
});
    

const createOrders = asyncHandler( async (req,res) => {
    try {
        const cart = await Cart.findOne({ user: req.user?._id });
        const orderItems = []; // Array to store the order items
        let totalPrice = 0; 
        for (const item of cart.items) {
            const cartitem = await CartItem.findById(item.cartItem).populate('product');
            const itemTotalPrice = cartitem.product.price * item.quantity;
            console.log(cartitem,cartitem.id)
            orderItems.push({
              item: cartitem.id,
              quantity: item.quantity,
              price: itemTotalPrice,
            });
          
            totalPrice += itemTotalPrice;
          }
          console.log(orderItems)
          req.body.user = req.user;
          req.body.orderItems = orderItems;
          req.body.totalAmount = totalPrice;
          req.body.orderId = generateOrderId();
        let order = await  Orders.create(req.body);
        if(order){
            
        }
        res.render('users/orderConfirmation',{user:req.user})
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = { getOrders, orderDetails, createOrders }