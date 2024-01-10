const User = require('../models/userModel');
const crypto = require('crypto');
const asyncHandler = require('express-async-handler');
const sendEmail = require('../utils/sendMail');
const moment = require('moment');
const bcrypt = require('bcrypt');



const forgotPassword = asyncHandler( async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
          return res.status(404).json('User not found' );
        }
        
        // Generate a unique token and set its expiration time (e.g., 1 hour)
        const token = crypto.randomBytes(20).toString('hex');
        const expirationTime = Date.now() + 3600000; // 1 hour
    
        // Save the token and expiration time in the user document
        user.resetPasswordToken = token;
        user.resetPasswordExpires = expirationTime;
        await user.save();

        // Compose the reset link with the generated token
        const resetLink = `https://voguish.world/reset-password/${token}`;
    
        // Send the reset link via email using the sendEmail function
        const subject = 'Password Reset';
        const text = `Click the following link to reset your password: ${resetLink}`;
        await sendEmail(email, subject, text);
    
        return res.status(200).json({ message: 'Reset link sent successfully', email });
    } catch (error) {
        console.error('Error in /forgot:', error);
        return res.status(400).json({ error: 'Internal Server Error' });
    }

});


const resetPassword = asyncHandler( async( req, res) => {
      // Retrieve user by token from the database
      const user = await User.findOne({
          resetPasswordToken: req.params.token,
          resetPasswordExpires: { $gt: moment().toDate() }, // Check if token is not expired
      });
  
      if (!user) {
        res.redirect(302, `/login?message=${encodeURIComponent('Invalid Token!')}` );
      }
      // Render the reset password page
      res.render('users/resetPassword', { token: req?.params?.token });
});


const changePassword = asyncHandler( async( req, res) => {
    try {
      const { password, confirmPassword } = req?.body;
    
      if (!password || password !== confirmPassword) {
        res.redirect(404 , `/reset-password/${req?.body?.token}?message=${encodeURIComponent('Passwords do not match')}` )
      }
  
      const user = await User.findOne({
        resetPasswordToken: req?.body?.token,
        resetPasswordExpires: { $gt: moment().toDate() }, // Check if token is not expired
      });
  
      if (!user) {
         res.redirect(404 , `/reset-password/${req?.body?.token}?message=${encodeURIComponent('Invalid token or token expired')}` )
      }
  
      user.password = password;
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      await user.save() 
      res.redirect(302 ,`/login?success=${encodeURIComponent("Password Reset Successfully!")}`)
      
    } catch (error) {
         next(error)
    }
      
});


const changeOldPassword = asyncHandler( async(req,res) => {
    try{
        const { newPassword, confirmPassword, currentPassword } = req?.body;
         
        console.log(newPassword, confirmPassword, currentPassword)
        if(newPassword !== confirmPassword){
            return res.status(400).json({ error: 'New password and confirm password do not match' });
        }
    
        if(newPassword === currentPassword){
            return res.status(400).json({ error: 'New password and Current Password are Same!' });
        }
    
        const user = await User.findById(req?.user?.id);
    
        if(user){
            const isCurrentPasswordValid = await user.comparePassword(currentPassword);

            if (!isCurrentPasswordValid) {
              return res.status(400).json({ error: 'Provided current password is incorrect' });
          }
            user.password = newPassword;
            await user.save();
            return res.status(200).json({success: "Password Changed SuccessFully!"});
        }
    } catch(error) {
        return res.status(500).json({error: "Something wrong happened!"})
    }
})


module.exports = { forgotPassword, resetPassword ,
                  changePassword, changeOldPassword };
