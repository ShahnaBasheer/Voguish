const User = require('../models/userModel');
const Address = require('../models/addressModel'); 
const asyncHandler = require('express-async-handler');
const { validateMobile } = require('../utils/validatePhone');
const { isEmailValid } = require('../utils/validateEmail');
const { otpEmailSend, cartQty } = require('../helperfns');


const getProfilePage =  asyncHandler( async(req,res) => {
    const user = req.user, totalQty = await cartQty(user);
    const userprofile  = await User.findById(req.user.id).lean();
    res.render('users/profileInfo',{user,userprofile,totalQty,
       bodycss:'/css/myprofile.css',bodyjs:'/js/myprofile.js'});
});


const getAddressPage = asyncHandler( async(req,res) => {
    const user = req.user, totalQty = await cartQty(user);
    const userprofile  = await User.findById(req.user.id).populate('addresses').populate('defaultAddress').lean();
    res.render('users/addressInfo',{user,userprofile,totalQty,
        bodycss:'/css/myprofile.css',bodyjs:'/js/myprofile.js'});
});



const editProfile = asyncHandler( async (req,res) => {
    try{
        const { email, phone, firstname, lastname, gender} = req.body;
        const user = await User.findById(req.user._id);
      
        if(firstname) user.firstname = firstname;
        if(lastname) user.lastname = lastname;
        if(gender) user.gender = gender;
        
        if(phone){
            if(user.phone !== phone){
                const isValid = await validateMobile(phone);
                if(isValid){
                   user.phone = phone;            
                }else{
                   return res.status(409).json({phoneText:"Mobile Number is Invalid or Already Exist"});
                }
            } else {
                return res.status(409).json({phoneText:"MobileNumber is same as existing MobileNumber"});
            }       
        }
    
        if(email){
          if(user.email !== email){
              if(await isEmailValid(email)){
                await otpEmailSend(req, "profile_setting", user.email);
                return res.status(200).json({oldemail:email,newemail:user.email,email:true});
              }else{
                return res.status(409).json({emailText:"Email is Invalid or Already Exist"});
              }
          }else{
              return res.status(409).json({emailText:"New email is same as existing email"});
          }  
        }
        await user.save();
        return res.status(200).json({ redirect: "/profile" });
    }catch(error){
      console.log(error)
      return res.status(500).json({ error: "Internal Server Error" });
    }
});


const addNewAddress = asyncHandler( async (req, res) => {
    const { firstname,lastname,phone,zipCode,address,city,
      state,landmark,alternativePhone } = req.body;
  
    try {
      const newAddress = new Address({firstname,lastname,phone,
          zipCode,address,city,state,landmark,alternativePhone
      });
      if (!req.user.addresses || req.user.addresses.length === 0) {
        // If no addresses, set the new address as the default address
        req.user.defaultAddress = newAddress._id;
      }
      req.user.addresses.push(newAddress._id);
      await newAddress.save();
      await req.user.save();
      res.redirect(req.header('Referer'));
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
});

const editAddress = asyncHandler(async (req, res) => {
    try {
        const { id, ...updatedFields } = req.body;
        const address = await Address.findByIdAndUpdate(id, updatedFields, { new: true });
        console.log(address)
        res.redirect('/profile')
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});


const deleteAddress = asyncHandler(async (req, res) => {
  try {
      const addressId = req.params.id;
      const deletedAddress = await Address.findByIdAndDelete(addressId);

      if (deletedAddress) {
          res.status(200).json({ success: true });
      } else {
          res.status(404).json({ success: false, message: 'Address not found' });
      }
  } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

const defaultAddress = asyncHandler( async(req,res) => {
    const { addressId } = req.body;
    try {
        const user = await User.findByIdAndUpdate(req.user._id, { defaultAddress: addressId }, { new: true });
        res.status(200).json({ message: 'Default address updated successfully', user });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});


module.exports = { getProfilePage, editProfile, 
     addNewAddress, editAddress, deleteAddress,
     defaultAddress, getAddressPage,
     }