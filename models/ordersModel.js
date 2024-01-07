const mongoose = require('mongoose');

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
    totalPrice: {
        type: Number,
    },
    shippingAddress: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address',
        required: true
    },
    shippingMethod: {
        type: String,
        enum: ['Standard', 'FastDelivery'],
        default: 'Standard', // Default value is 'standard'
        required: true
    },
    shippingCharge: {
        type: Number,
        default: 0,
        required: true,
    },
    paymentMethod: {
        type: String,
        enum: ['Razorpay', 'CashOnDelivery', 'Wallet'],
    },
    walletPayment: {
        type: Number,
        default: 0,
        required: true,
    },
    delivery: {
        type: Number,
        required: true,
        default: 0,
    },
    GrandTotal:{
        type: Number,
        required: true,
        default: 0,
    },
    couponApplied: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Coupon',
    },
    couponPrice: {
        type: Number,
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Paid', 'Failed', 'Refund', 'Cancelled'],
        default: function () {
            // Set paymentStatus as 'Pending' if paymentMethod is 'Cash on Delivery'
            return this.paymentMethod === 'CashOnDelivery' ? 'Pending' : 'Paid';
        }
    },
    paymentInfo: {
        type: mongoose.Schema.Types.Mixed,
        // You can add any other specific properties based on the payment method
    },
    status: {
        type: String,
        enum: ['Processing', 'Shipped', 'Failed', 'Delivered', 'Cancelled', 'Returned'],
        default: 'Processing',
        required: true,
    },
    reason : {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});


orderSchema.pre('save', async function (next) {
    next()
});


const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
