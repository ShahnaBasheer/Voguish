const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    couponTitle: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
      validate: {
          validator: function (endDate) {
            return endDate.getTime() > this.startDate.getTime();
          },
          message: 'End date must be greater than start date',
      },
    },
    discount: {
      type: Number, 
      required: true,
    },
    maxDiscountAmount: {
      type: Number, 
      required: true,
    },
    minPurchaseAmount: {
      type: Number, 
      required: true,
    },
    isForAllUsers: {
      type: Boolean,
      default: true, // Assuming it's applicable to all users by default
    },
    targetUserGroups: {
      type: [String], // Assuming user groups are represented by strings
      default: [],
    },
    usageLimit: {
      type: Number,
      default: null, // Unlimited usage by default; set a specific number for a limit
    },
    timesUsed: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['Active', 'Expired', 'Cancelled'],
      required: true,
    },
  },
  { timestamps: true }
);

// Middleware to update status to 'Expired' when endDate is reached
couponSchema.pre('save', function (next) {
  if (this.isModified('endDate') && this.endDate < new Date()) {
    this.status = 'Expired';
  }
  next();
});

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon;
