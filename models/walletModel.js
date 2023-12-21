const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Reference to the User collection
      required: true,
  },
  balance: {
      type: Number,
      default: 0,
      required: true,
  },
  transactionHistory: [
      {
        type: {
            type: String, // 'credit', 'debit', or 'refund'
            enum: ['credit', 'debit', 'refund'],
            required: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        method: {
            type: String, // Specify the method or reason for the transaction
            enum: [
                'manual_credit',
                'online_top_up_credit',
                'purchase_debit',
                'order_cancel_refund',
            ],
        },
        transactionInfo: {
            type: mongoose.Schema.Types.Mixed,
        },
        addedDate: {
            type: Date,
            default: Date.now,
        },
        // Additional fields for refunds
        refund: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Refund', // Reference to a Refund collection if needed
        },
      },
    ],
}, { timestamps: true });

const Wallet = mongoose.model('Wallet', walletSchema);

module.exports = Wallet;
