const User = require('../models/userModel');
const Address = require('../models/addressModel'); 
const asyncHandler = require('express-async-handler');
const { validateMobile } = require('../utils/validatePhone');
const { isEmailValid } = require('../utils/validateEmail');
const { otpEmailSend, cartQty, getAllBrands } = require('../helperfns');


const getProfilePage =  asyncHandler( async(req,res) => {
    const user = req.user, totalQty = await cartQty(user);
    const Brands = await getAllBrands();
    const userprofile  = await User.findById(req.user.id).lean();
    res.render('users/profileInfo',{user,userprofile,totalQty,Brands,
       bodycss:'/css/myprofile.css',bodyjs:'/js/myprofile.js'});
});


const getAddressPage = asyncHandler( async(req,res) => {
    const user = req.user, totalQty = await cartQty(user);
    const Brands = await getAllBrands();
    const userprofile  = await User.findById(req.user.id).populate('addresses').populate('defaultAddress').lean();
    res.render('users/addressInfo',{user,userprofile,totalQty,Brands,
        bodycss:'/css/myprofile.css',bodyjs:'/js/myprofile.js'});
});



const editProfile = asyncHandler( async (req,res) => {
    const { email, phone, firstname, lastname, gender} = req.body,
        user = await User.findById(req?.user?._id);
      
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
      if(user?.email !== email){
          if(await isEmailValid(email)){
            await otpEmailSend(req, "profile_setting", user.email);
            return res.status(200).json({oldemail:email,newemail:user?.email,email:true});
          }else{
            return res.status(409).json({emailText:"Email is Invalid or Already Exist"});
          }
      }else{
          return res.status(409).json({emailText:"New email is same as existing email"});
      }  
    }
    await user?.save();
    return res.status(200).json({ redirect: "/profile" });
});


const addNewAddress = asyncHandler( async (req, res) => {
    const { firstname,lastname,phone,zipCode,address,city,
        state,landmark,alternativePhone } = req?.body;
  
    const newAddress = new Address({firstname,lastname,phone,
        zipCode,address,city,state,landmark,alternativePhone
    });
    if (!req?.user?.addresses || req?.user?.addresses?.length === 0) {
        req.user.defaultAddress = newAddress?._id;
    }
    req.user.addresses.push(newAddress?._id);
    await newAddress?.save();
    await req?.user?.save();
    res.redirect(req.header('Referer'));
});

const editAddress = asyncHandler(async (req, res) => {
    const { id, ...updatedFields } = req?.body;
    const address = await Address.findByIdAndUpdate(id, updatedFields, { new: true });
    res.redirect('/profile')
});


const deleteAddress = asyncHandler(async (req, res) => {
    const addressId = req.params.id,
          deletedAddress = await Address.findByIdAndDelete(addressId);

    if (deletedAddress) {
        res.status(200).json({ success: true });
    } else {
        res.status(404).json({ success: false, message: 'Address not found' });
    }
});

const defaultAddress = asyncHandler( async(req,res) => {
    const { addressId } = req?.body;
    const user = await User.findByIdAndUpdate(req?.user?._id, { defaultAddress: addressId }, { new: true });
    res.status(200).json({ message: 'Default address updated successfully', user });
});


module.exports = { getProfilePage, editProfile, 
     addNewAddress, editAddress, deleteAddress,
     defaultAddress, getAddressPage,
     }