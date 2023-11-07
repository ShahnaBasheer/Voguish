const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const { generateToken, generateAdminToken} = require('../config/jwToken');


const authMiddleware = asyncHandler(async (req, res, next) => {
    const accessToken = req.cookies?.accessToken;
    const refreshToken = req.cookies?.refreshToken;

    try {
        if (!accessToken && !refreshToken) {
            throw new Error("Not authorized: no access token");
        }

        const decodedAccessToken = jwt.verify(accessToken, process.env.JWT_SECRET);
        const user = await User.findById(decodedAccessToken.id);

        if (!user) {
            return res.status(401).json({ message: "User not found!" });
        }

        req.user = user;
        next();
    } catch (error) {
        console.log(error.message);
        try {
            if (error instanceof jwt.TokenExpiredError || !accessToken) {
                console.log("Access token expired for user");
                if (!refreshToken) {
                    throw new Error("No Refresh Token in Cookies");
                }

                const decodedRefreshToken = jwt.verify(refreshToken, process.env.JWT_SECRET);
                const user = await User.findOne({ _id: decodedRefreshToken.id });

                if (!user) {
                    throw new Error("No Refresh token present in db or not matched");
                }

                const newAccessToken = generateToken(user);
                req.user = user;
                res.clearCookie('accessToken');
                res.cookie('accessToken', newAccessToken, {
                    httpOnly: true,
                    secure: true,
                    maxAge: 15 * 60 * 1000, // Set the new access token expiration time
                });
            }
            next();
        } catch (error) {
            console.log(error.message);
            next();
        }
    }
});


// check user is authorized
const isUser = asyncHandler(async (req, res, next) => {
    if(req?.user){
        const { email } = req.user;
        const user = await User.findOne({email});
    
        if(user && user.role === 'user'){
            if(!user.isBlocked) next();
            else{
                res.clearCookie("accessToken")
                res.clearCookie("refreshToken")
                return res.render('users/account-blocked')
            }    
        } 
        else throw new Error('You are not a Regular User!!');
    }else{
        console.log("user without token")
        next();
    }
    
});

// check user is loggedin already
const isLoggedInUser = asyncHandler(async (req, res, next) => {
    if (req?.user) {
        const { email } = req.user;
        const user = await User.findOne({email});
        console.log("user with token")
        if(user && user.role === 'user')return res.redirect('/home');
        else next();
    }
    console.log("user without token")
    next();
});


//admin auth middleware
const adminAuth = asyncHandler(async (req, res, next) => {
    const accessToken = req.cookies?.adminAccessToken;
    const refreshToken = req.cookies?.adminRefreshToken;
    try {
        if (!accessToken && !refreshToken) {
            throw new Error("Not authorized: no access token");
        }
        const decodedAccessToken = jwt.verify(accessToken, process.env.JWT_ADMIN_SECRET);
        const user = await User.findById(decodedAccessToken.id);
        if (!user) {
            return res.status(401).json({ message: "Admin not found!" });
        }

        req.user = user;
        next();
    } catch (error) {
        console.log("Error:",error.message);
        try {
            if (error instanceof jwt.TokenExpiredError || !accessToken) {
                console.log("Accesstoken expired for admin");
                if (!refreshToken) {
                    throw new Error("No Refresh Token in Cookies");
                }

                const decodedRefreshToken = jwt.verify(refreshToken, process.env.JWT_REFRESH_ADMIN_SECRET);
                const user = await User.findOne({ _id: decodedRefreshToken.id });

                if (!user) {
                    throw new Error("No Refresh token present in db or not matched");
                }

                const newAccessToken = generateAdminToken(user);
                req.user = user;
                res.clearCookie('adminAccessToken');
                res.cookie('adminAccessToken', newAccessToken, {
                    httpOnly: true,
                    secure: true,
                    maxAge: 15 * 60 * 1000, // Set the new access token expiration time
                    sameSite: 'Lax' 
                });
            }
            next();
        } catch (error) {
            console.log("Error:",error.message);
            next();
        }
    }
});



// check user is admin
const isAdmin = asyncHandler(async (req, res, next) => {
    if(req?.user){
        const { email } = req.user;
        const user = await User.findOne({email});
        if(user && user.role == 'admin') next();
        else throw new Error('You are not an Admin!');
    }else return res.redirect('/admin');
});

// check user is loggedin already
const isLoggedInAdmin = asyncHandler(async (req, res, next) => {  
    if (req?.user) {
        const { email } = req.user;
        const user = await User.findOne({email});
    
        if(user && user.role === 'admin') return res.redirect('/admin/dashboard');
        else next();
    } 
    console.log("admin without token")
    next();
});



module.exports = { 
    authMiddleware, isAdmin, isUser,
    isLoggedInUser, isLoggedInAdmin, adminAuth,
};
