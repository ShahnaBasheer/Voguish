const mongoose = require('mongoose');
const CartItem = require('./cartItemModel');
const Address = require('./addressModel');


const orderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: true,
        unique: true // Ensures that each order has a unique order ID
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    orderItems: [{
        item: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'CartItem',
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
            default: 1,
            min: 1   
        },
        price: {
          type: Number,
          required: true
        },
    }],
    totalAmount: {
        type: Number,
    },
    shippingAddress: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address',
        required: true
    },
    shippingMethod: {
        type: String,
        enum: ['standard', 'fast delivery'],
        default: 'standard', // Default value is 'standard'
        required: true
    },
    status: {
        type: String,
        enum: ['Processing', 'Shipped', 'Delivered'],
        default: 'Processing'
    },
    paymentMethod: {
        type: String,
        enum: ['Credit Card', 'PayPal', 'Cash on Delivery'],
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Paid'],
        default: function () {
            // Set paymentStatus as 'Pending' if paymentMethod is 'Cash on Delivery'
            return this.paymentMethod === 'Cash on Delivery' ? 'Pending' : 'Paid';
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

orderSchema.pre('save', async function (next) {
    if (this.shippingMethod === 'fast delivery') {
        this.totalAmount += 25; // Add extra cost for fast delivery
    }
    next();
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
