const asyncHandler = require('express-async-handler');
const Wallet = require('../models/walletModel');
const Order = require('../models/ordersModel')
const { cartQty} = require('../helperfns');



const getWallet = asyncHandler( async(req, res) => {
    try {
      const user = req?.user, totalQty = await cartQty(user);
      const wallet = await Wallet.findOne({ user: user._id }).lean();

      res.render('users/wallet',{user, totalQty, wallet,
         bodycss:'/css/myprofile.css',bodyjs:'/js/myprofile.js'});
      
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



const addToWallet = asyncHandler(async (req, res) => {
  try {
      let amount = parseFloat(req?.body?.amount) || 0;
      let method = req?.body?.method;
      let user = req?.user;

      // Validate amount and method
      if (isNaN(amount) || amount <= 0 || !method) {
          return res.status(400).json({ error: 'Invalid amount or method' });
      }

      let wallet = await Wallet.findOne({ user: user._id });

      if (!wallet && method === 'manual_credit') {
          wallet = await Wallet.create({
              user: user._id,
              balance: amount,
              transactionHistory: [
                {
                    type: 'credit',
                    amount: amount,
                    method: method,
                },
            ],
          });
      } else {
          // Validate method or add additional conditions if needed
          if (method !== 'manual_credit') {
              return res.status(400).json({ error: 'Invalid method for this operation' });
          }

          wallet.balance += amount;
          wallet.transactionHistory.unshift({
            type: 'credit',
            amount: amount,
            method: method,
         });
      } 

      await wallet.save();

      res.redirect(req.header('Referer'));
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});



const redeemFromWallet = asyncHandler(async (req, res) => {
    try {
        const user = req?.user;
        const { grandTotal } = req?.body;
        let isWalletUsedFull = isWalletUsedPartial = false;
        const wallet = await Wallet.findOne({ user: user?.id });

        if (!wallet) {
            return res.status(404).json({ error: 'Wallet not found' });
        }

        if (wallet?.balance === 0) {
            return res.status(400).json({ error: 'Insufficient balance in the wallet! Go for another payment method' });
        }

        if(wallet?.balance >= grandTotal){
            isWalletUsedFull = true;
        } else {
            isWalletUsedPartial = true;
        }

        // Calculate the amount to be redeemed
        const redeemAmount = Math.min(grandTotal, wallet.balance);
        const walletBalance = wallet.balance - redeemAmount;
        const GrandTotal = grandTotal - redeemAmount;

        res.json({ redeemAmount, wallet, walletBalance, isWalletUsedFull, isWalletUsedPartial, GrandTotal });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          
});



module.exports = { getWallet, addToWallet, redeemFromWallet}