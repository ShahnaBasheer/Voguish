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
    total : {
        type: Number,
        required:true,
        default: 0,
    },
    },{ timestamps : true });


    cartSchema.pre('save',async function(next) {
        try {
            let totalPrice = totalMrp = 0;
            
            for(let item of this.items){
                const cartitem = await CartItem.findById(item.cartItem);
                const product = await Product.findById(cartitem.product)
                totalPrice += (item.quantity * product.price);
                totalMrp += (item.quantity * product.mrp)        
            }
            this.totalPrice = totalPrice;
            this.totalMrp = totalMrp;

            if(totalPrice >= 500) this.deliveryCharge = 0; 
            else this.deliveryCharge = 50;
            this.total = this.totalPrice + this.deliveryCharge; 
            next();
        } catch (error) {
            next(error);
        }
    });

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
