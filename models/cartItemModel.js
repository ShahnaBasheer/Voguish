const mongoose = require('mongoose');


const cartItemSchema = new mongoose.Schema({
  product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
  },
  size: {
      type: String,
      required: true,
      default: "Free Size",
  },
  color: {
      type: String,
      default: null
  }
});

const CartItem = mongoose.model('CartItem', cartItemSchema);

module.exports = CartItem;
