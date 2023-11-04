const mongoose = require('mongoose');

const reviewSchema = new Schema({
  product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
  },
  postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
  },
  title: {
      type: String,
  },
  description: {
      type: String,
      required: true,
  },
  rating: {
      type: Number,
      required: true,
  },
  createdAt: {
      type: Date,
      default: Date.now,
  },
});

const Review = mongoose.model('Review', reviewSchema);
