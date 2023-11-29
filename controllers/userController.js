const User = require('../models/userModel');
const { generateToken, generateRefreshToken,
       generateAdminToken, generateAdminRefreshToken  } = require('../config/jwToken');
const asyncHandler = require('express-async-handler');
const validateMongodbId = require('../utils/validateMongodbId');
const { isValidEmail } = require('../utils/validateEmail');
const { validatePhoneNumber } = require('../utils/validatePhone');
const { otpEmailSend } = require('../helperfns');
const sendEmail = require('../utils/sendMail');


//Create new user from signup form
const createUser = asyncHandler(async (req,res) => {
    const { email} = req.body;
    const user = await User.find({email});
    try {
        if(user){
            if(!user.isVerified) await User.deleteOne({ email});
            else return res.redirect('/signup');
        }
        await otpEmailSend(req, true);
        res.render('users/otpverification',{email,bodyjs:'js/otp.js'});
    } catch (error) {
        console.log(error)
        return res.redirect(req.header('Referer'));
    }
});

 
const resendOtpCode = asyncHandler(async (req, res) => {
    try {
        const { email } = req.body;

        if (req.rateLimit.remaining < 0) {
            res.status(429).json({ message: 'Too many OTP requests. Try again later.' });
        }

        const user = await User.findOne({ email });
        if (user && !user.isVerified) {
             await otpEmailSend(req, false, email);
             res.status(200).json({ message: 'OTP resent successfully' });
        } else {
          res.status(404).json({ message: 'User not found or already verified' });
        }
    } catch (error) {
        console.error('Error sending OTP:', error);
        res.status(500).json({ error: 'Failed to resend OTP. Please try again.' });
    }
});
  
  

//OTP verification
const otpVerification = asyncHandler( async (req,res) => {
    const {txt1,txt2,txt3,txt4,txt5,txt6,email} = req.body;
    const otp = [txt1, txt2, txt3, txt4, txt5, txt6].join(''); 
    const user = await User.findOne({ email, otp });
    try{    
        if (user && user?.otpTimestamp) {
            const currentTime = new Date();
            const otpTimestamp = new Date(user.otpTimestamp);
            const timeDifferenceInMinutes = (currentTime - otpTimestamp) / (1000 * 60);
            
            if (timeDifferenceInMinutes <= 10) {
                // OTP is valid within the 10-minute window
                const subject = "Welcome to VOGUISH";
                const text = `Dear ${user.firstname} ${user.lastname},\n
                Welcome to VOGUISH!\n We are thrilled to have you on board.Thank you for choosing us as your go-to destination for all your shopping needs.\n
                At VOGUISH, we offer a wide range of products,from the latest fashion trends.With our curated selection and exceptional customer service, we are committed to making your shopping experience delightful and hassle-free`;
  
                await sendEmail(email, subject, text);
                await User.updateOne({ email }, { $set: { isVerified: true } });
                const successMessage = 'You have successfully signed up! Please Login here';
                res.redirect(`/login?success=${encodeURIComponent(successMessage)}`);
            } else {
                res.render('users/otpverification', { email, bodyjs: 'js/otp.js', message: 'Expired OTP!' });
            }   
        } else {
            res.render('users/otpverification', { email, bodyjs: 'js/otp.js', message: 'Invalid OTP!' });
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: 'Internal Server Error.' });
    }
  });

//login user from login form
const loginUser = asyncHandler(async (req, res) =>{
    const { email,password } = req.body;
    try{
        const findUser = await User.findOne({ email });
        if(findUser?.isBlocked) return res.redirect('/account-blocked');
    
        if(findUser && await findUser?.comparePassword(password) && findUser?.role =='user' && findUser.isVerified){
            const accessToken = generateToken(findUser?.id);
            const refreshToken = generateRefreshToken(findUser?.id);
            await User.findByIdAndUpdate(findUser.id,{refreshToken:refreshToken});
    
            res.cookie('accessToken', accessToken, {
                httpOnly: true,
                secure: true,
                maxAge: 15 * 60 * 1000,
                sameSite: 'Lax' ,
            });
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: true,
                maxAge: 3 * 24 * 60 * 60 * 1000, 
                sameSite: 'Lax' ,
            });
            res.redirect('/');
        }else{
            console.log("Invalid Credentials");
            res.redirect('/login')
        }
    }catch(error){
        console.log(error);
    }
});


//Update a user
const updateUser = asyncHandler( async (req,res) => {
    const { _id } = req.user;
    validateMongodbId(_id);
    try{
        const getUsers = await User.findByIdAndUpdate(_id,
            {
                firstname: req?.body?.firstname,
                lastname: req?.body?.lastname,
                email: req?.body?.email,
                phone: req?.body?.phone,
                password: req?.body?.password,
            },
            {new : true, }
        );
        res.json(getUsers)
    } catch(error){
        throw new Error(error);
    }
});

//get All users
const getAllUsers = asyncHandler( async (req,res) => {
    try{
        const users = await User.find().populate('addresses').lean();
        res.render('admin/users',{admin:true,adminInfo:req.user,users});
    } catch(error){
        throw new Error(error);
    }
});

//get a single user
const getUser = asyncHandler( async (req,res) => {
    const { id } = req.params;
    validateMongodbId(id);
    try{
        const getUsers = await User.findById(id);
        res.json({getUsers})
    } catch(error){
        throw new Error(error);
    }
});

//get delete a user
const deleteUser = asyncHandler( async (req,res) => {
    const { id } = req.params;
    validateMongodbId(id);
    try{
        const deleted = await User.findByIdAndDelete(id);
        const fullname = deleted?.firstname + " " + deleted?.lastname;
        res.redirect('/admin/users');
    } catch(error){
        throw new Error(error);
    }
});

//Block user
const blockUser = asyncHandler( async (req,res,next)=> {
    const { id } = req.params;
    validateMongodbId(id);
    try{
        const users = await User.find().lean();
        await User.findByIdAndUpdate(id,{isBlocked : true},{new:true});
        req.flash('success', 'User successfully blocked');
       
       res.redirect('/admin/users')
    } catch(error) {
        throw new Error(error);
    }
});

//Unblock user
const unblockUser = asyncHandler( async (req,res,next)=> {
    const { id } = req.params;
    try{
        await User.findByIdAndUpdate(id,{isBlocked : false},{new:true});
        req.flash('success', 'User successfully unblocked');
        res.redirect('/admin/users');
    } catch(error) {
        throw new Error(error);
    }
});

//logout user
const logout = asyncHandler(async (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        throw new Error("No Refresh Token in Cookies");
    }

    // Clear both access token and refresh token cookies
    res.clearCookie("accessToken", {
        httpOnly: true,
        secure: true,
    });
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: true,
    });

    await User.findOneAndUpdate({ refreshToken }, { refreshToken: "" });
    const redirectUrl = req.query.redirect || '/';
    return res.redirect(redirectUrl);
});


//Email checking to know if already exist
const emailCheck = asyncHandler( async (req,res) => {
    const email = req.query.email;
    const isEmailValid = await isValidEmail(email);
    res.json({exists : isEmailValid});    
});

//phone number checking to know if already exist
const phoneCheck = asyncHandler( async (req,res) => {
    const phone = req.query.phone;
    const isValid = await validatePhoneNumber(phone);
    res.json({exists : isValid});    
});

//Display Admin Login
const adminLogin = asyncHandler( async (req,res) => {
    const { email, password } = req.body;
    const findadmin = await User.findOne({ email });

    try {
        if (findadmin && await findadmin.comparePassword(password) && findadmin.role === "admin") {
            const accessToken = generateAdminToken(findadmin?.id);
            const refreshToken = generateAdminRefreshToken(findadmin?.id);
            await User.findByIdAndUpdate(findadmin.id, { refreshToken }, { new: true });

            res.cookie("adminAccessToken", accessToken, {
                httpOnly: true,
                secure: true, // Set to true if served over HTTPS
                maxAge:  15 * 60 * 1000,
                sameSite: 'Lax' ,
            });

            res.cookie("adminRefreshToken", refreshToken, {
                httpOnly: true,
                secure: true, 
                maxAge: 2 * 24 * 60 * 60 * 1000,
                sameSite: 'Lax',
            });
            return res.redirect('dashboard'); 
        } else {
            throw new Error("Invalid email or password!");
        }
    } catch (error) {
        console.error(error);
        req.flash('alert', 'You are not Authorized to access this page!')
       return res.redirect('/admin')
    }
});

const adminLogout = asyncHandler (async(req,res) => {
    const refreshToken = req.cookies.adminRefreshToken;

    if (!refreshToken) throw new Error("No Refresh Token in Cookies");
    
    res.clearCookie("adminAccessToken", {
        httpOnly: true,
        secure: true,
    });
    res.clearCookie("adminrRereshToken", {
        httpOnly: true,
        secure: true,
    });

    await User.findOneAndUpdate({ refreshToken }, { refreshToken: "" });
    return res.redirect('/admin');
});

module.exports = {
    createUser,
    loginUser,
    updateUser, 
    getAllUsers, 
    getUser, 
    deleteUser,
    blockUser,
    unblockUser,
    logout, 
    emailCheck,
    phoneCheck,
    adminLogin,
    adminLogout,
    otpVerification,
    resendOtpCode,
}





