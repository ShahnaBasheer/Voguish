const mongoose = require('mongoose');
const CartItem = require('./cartItemModel');
const Product = require('./productModel');



const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [{
        cartItem: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'CartItem',
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
            default: 1,
            min: 1   }
        }],
    totalPrice: {
        type: Number,
        required: true,
        default: 0
    },
    totalMrp: {
        type: Number,
        required: true,
        default: 0
    },
    deliveryCharge: {
        type: Number,
        required: true,
        default: 50,
    },
    totalAmount : {
        type: Number,
        required:true,
        default: 0,
    },
    },{ timestamps : true });


    cartSchema.pre('save',async function(next) {
        try {
            let totalMrp = 0;
            let totalPrice = 0;
    
            for (const item of this.items) {
                const cartItem = await CartItem.findById(item.cartItem).populate('product');
                if (cartItem && cartItem.product) {
                    totalMrp += cartItem.product.mrp * item.quantity;
                    totalPrice += cartItem.product.price * item.quantity;
                }
            }
    
            this.totalMrp = totalMrp;
            this.totalPrice = totalPrice;
    
            if (totalPrice >= 500 || !this.items.length) {
                this.deliveryCharge = 0;
            } else {
                this.deliveryCharge = 50;
            }
    
            this.totalAmount = this.totalPrice + this.deliveryCharge;
            next();
        } catch (error) {
            next(error);
        }
    });

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
