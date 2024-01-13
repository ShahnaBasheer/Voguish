const asyncHandler = require('express-async-handler');
const Product = require('../models/productModel');
const WishList = require('../models/wishListModel');
const Order = require('../models/ordersModel');
const Users = require('../models/userModel');
const { cartQty, genderBrandFilter, getAllBrands } = require('../helperfns');


//Display Login page
const getLoginPage = asyncHandler(async (req,res) => {
   const successMessage = req?.query?.success; 
   const Brands = await getAllBrands();
   const message = req?.query?.message;
   res.render('users/signin',{bodycss:'css/login_signup.css',successMessage, message, Brands}); 
});

//Display Signup page
const getSignupPage = asyncHandler( async (req,res) => {
   const Brands = await getAllBrands();
   res.render('users/signup',{Brands, bodycss:'css/login_signup.css',
      bodyjs:'js/signUp.js'});
});

//Display Home page
const getHomePage = asyncHandler(async (req,res) => { 
   let user = req?.user, totalQty = await cartQty(user);
   const Brands = await getAllBrands();

   const wishlist = new Set(
      (await WishList.findOne({ user: req?.user?.id }).distinct('products').lean() || []).map((id) =>
          id.toString()
      )
   );

   const newarrivals = await Product.find(
      {isDeleted:false,isDeletedBy:false}).populate('brand')
      .populate('category').sort({ createdAt: -1 }).limit(5).lean();

   newarrivals?.forEach(product => {
      product.isInWishlist = wishlist.has(product._id.toString());
   });
       
   res.render('users/home',{user,newarrivals,totalQty,wishlist,
      Brands,maincss:'css/home.css',bodyjs:'js/productCard.js'});
});

//Display Women page
const getWomenPage = asyncHandler( async (req,res) => {
   await genderBrandFilter('gender','women',req,res);
});

//Display Men page
const getMenPage = asyncHandler( async (req,res) => {
   await genderBrandFilter('gender','men',req,res);
});


//Display Kids page
const getKidsPage = asyncHandler( async (req,res) => {
   await genderBrandFilter('gender','kids',req,res); 
});

//Display Girls page
const getGirlsPage = asyncHandler( async (req,res) => {
   await genderBrandFilter('gender','girls',req,res); 
});

//Display Boys page
const getBoysPage = asyncHandler( async (req,res) => {
   await genderBrandFilter('gender','boys',req,res);  
});

//get Contact page 
const getContactPage = asyncHandler( async (req,res) => {
   let user = req?.user, totalQty = await cartQty(user);
   const Brands = await getAllBrands();
   res.render('users/contact',{user,totalQty,Brands});
});

//otp verification
const otpVerify = asyncHandler(async(req,res) => {
   const Brands = await getAllBrands();
   res.render('users/otpverification',{bodyjs:'js/otp.js',Brands});
});


//Display Admin Dashboard
const getDashboard = asyncHandler( async (req,res) => {
   const today = new Date(),
      currentYear = today.getFullYear(),
      startOfPreviousWeek = new Date(today);

   startOfPreviousWeek.setUTCDate(today.getUTCDate() - 6);
   startOfPreviousWeek.setUTCHours(0, 0, 0, 0);

   const YearlySales = await Order.aggregate([
      {
        $match: { createdAt: { $exists: true }, status: { $ne: 'Cancelled' } }
      },
      {
         $group: {
            _id: { year: { $year: '$createdAt' }, },
            totalSales: { $sum: '$GrandTotal' },
            orderCount: { $sum: 1 } 
         }
      },
      { $sort: { '_id.year': 1 } },
      { $project: { _id: 0, year: '$_id.year', totalSales: '$totalSales', orderCount: '$orderCount'} }
      ]);
       
       
   const MonthlySales = await Order.aggregate([
      {
         $match: {
            createdAt: { $exists: true },
            status: { $ne: 'Cancelled' },
            $expr: { $eq: [{ $year: '$createdAt' }, currentYear] }
         }
      },
      {
         $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: {
               $let: {
                  vars: {
                     months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                     monthIndex: { $month: '$createdAt' }
                  },
                  in: { $arrayElemAt: ['$$months', { $subtract: ['$$monthIndex', 1] }] }
               }
            },/*
              month: { $month: '$createdAt' },
              month: {
               $substr: [
                  { $dateToString: { format: '%B',date: '$createdAt',timezone: '+05:30'}},
                  0,3
                ]
              },*/
            },
            totalSales: { $sum: '$GrandTotal' },
            orderCount: { $sum: 1 }
         }
      },
      { $sort: {'_id.month': 1 } },
      {
         $project: { _id: 0, month: '$_id.month', totalSales: '$totalSales', orderCount: '$orderCount'}
      }
   ]);

   const WeeklySales = await Order.aggregate([
      {
        $match: {
          createdAt: { $exists: true },
          status: { $ne: 'Cancelled' },
          createdAt: { $gte: startOfPreviousWeek }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: '+05:30' } }
          },
          totalSales: { $sum: '$GrandTotal' },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { '_id.date': 1 }},
      {
        $project: { _id: 0, date: '$_id.date', totalSales: '$totalSales',orderCount: '$orderCount' }
      }
   ]);

   const AllUsers = await Users.find().count();

   // Create an array of days (formattedStartOfWeek, formattedStartOfWeek + 1 day, ..., today)
   const daysInRange = Array.from({ length: 7 }, (_, i) => {
         const day = new Date(startOfPreviousWeek);
         day.setDate(startOfPreviousWeek.getDate() + i);
         return day.toISOString().split('T')[0];
   });

   let updatedWeeklySales = daysInRange.map((day, index) => {
         const matchingDay = WeeklySales.find(item => item.date === day);
         if(matchingDay)matchingDay.day = index + 1;
         return matchingDay || { date: day, totalSales: 0,  orderCount: 0 ,day: index+1};
   });

   let monthRange =  ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun','Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

   let updatedMonthlySales = monthRange.map((month, index) => {
       const matchingDay = MonthlySales.find(item => item.month === month);
       return matchingDay || { month: month, totalSales: 0,  orderCount: 0 };
   });
       
   let AllSales = YearlySales.reduce((total,value) => total + value.totalSales, 0  );
   let OrderCount = YearlySales.reduce((total,value) => total + value.orderCount, 0  );

   // Format the number as currency with commas
   let TotalSales = AllSales.toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
   });
 
   res.render('admin/dashboard',{admin:true,adminInfo:req?.user,
        __active: 'dashboard',
        WeeklySales: JSON.stringify(updatedWeeklySales),
        YearlySales: JSON.stringify(YearlySales),
        MonthlySales: JSON.stringify(updatedMonthlySales),
        TotalSales,OrderCount,AllUsers,
   });
});



//Display Admin Login
const getAdminLogin = asyncHandler( async (req,res) => { 
   const message = req?.query?.message;
   res.render('admin/adminLogin',{admin:true,adminlogin:true,bodycss:'/css/login_signup.css', message});
});

//display account-blocked page
const getBlocked = asyncHandler (async(req,res) => {
   res.render('users/account-blocked');
});




module.exports = {
    getLoginPage,
    getSignupPage,
    getHomePage,
    getWomenPage,
    getMenPage,
    getKidsPage,
    getGirlsPage,
    getBoysPage,
    getDashboard,
    getAdminLogin,
    getBlocked,
    otpVerify,
    getContactPage,  
}

