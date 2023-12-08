const asyncHandler = require('express-async-handler');
const Product = require('../models/productModel');
const Brand = require('../models/brandModel');
const Order = require('../models/ordersModel');
const Users = require('../models/userModel');
const moment = require('moment');
const { cartQty, genderBrandFilter } = require('../helperfns');


//Display Login page
const getLoginPage = asyncHandler(async (req,res) => {
   const successMessage = req.query.success; 
   res.render('users/signin',{bodycss:'css/login_signup.css',successMessage}); 
});

//Display Signup page
const getSignupPage = asyncHandler( async (req,res) => {
   res.render('users/signup',{bodycss:'css/login_signup.css',
   bodyjs:'js/signUp.js'});
});

//Display Home page
const getHomePage = asyncHandler(async (req,res) => {
   try{ 
        let user = req?.user, totalQty = await cartQty(user);
        const allBrands = await Brand.find({isDeleted:false}).distinct('brand');
        const Brands = allBrands.sort();
        const newarrivals = await Product.find(
         {isDeleted:false,isDeletedBy:false}).populate('brand')
            .populate('category').sort({ createdAt: -1 }).limit(5).lean();
        res.render('users/home',{user,newarrivals,totalQty,Brands,
           bodycss:'css/nav_footer.css',maincss:'css/home.css',
           bodyjs:'js/productCard.js'});
   } catch(error){
       console.log(error) 
   }
});

//Display Women page
const getWomenPage = asyncHandler( async (req,res) => {
   try{  
      await genderBrandFilter('gender','women',req,res);
   } catch(error) {
       throw new Error(error);
   }
});

//Display Men page
const getMenPage = asyncHandler( async (req,res) => {
   try{
      await genderBrandFilter('gender','men',req,res);
   } catch(error) {
      throw new Error(error);
   }
});


//Display Kids page
const getKidsPage = asyncHandler( async (req,res) => {
   try{
      await genderBrandFilter('gender','kids',req,res); 
   } catch(error) {
      throw new Error(error);
   }
});

//Display Girls page
const getGirlsPage = asyncHandler( async (req,res) => {
   try{
      await genderBrandFilter('gender','girls',req,res); 
   } catch(error) {
      throw new Error(error);
   }
});

//Display Boys page
const getBoysPage = asyncHandler( async (req,res) => {
   try{
      await genderBrandFilter('gender','boys',req,res);  
   } catch(error) {
      throw new Error(error);
   }
});

//get Contact page 
const getContactPage = asyncHandler( async (req,res) => {
   let user = req?.user, totalQty = await cartQty(user);
   const allBrands = await Brand.find({isDeleted:false}).distinct('brand');
   const Brands = allBrands.sort();
   res.render('users/contact',{user,totalQty,Brands});
});

//otp verification
const otpVerify = asyncHandler(async(req,res) => {
   const allBrands = await Brand.find({isDeleted:false}).distinct('brand');
   const Brands = allBrands.sort();
   res.render('users/otpverification',{bodyjs:'js/otp.js',Brands});
});


//Display Admin Dashboard
const getDashboard = asyncHandler( async (req,res) => {
   try {
       const today = new Date();
       const currentYear = today.getFullYear()
      
      const startOfPreviousWeek = new Date(today);
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
         {
            $project: { _id: 0, year: '$_id.year', totalSales: '$totalSales', orderCount: '$orderCount'}
          }
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
                  $substr: [
                    { $dateToString: { format: '%B',date: '$createdAt',timezone: '+05:30'}},
                    0,3
                  ]
                },
               
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

       let monthRange =  ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

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
         
      res.render('admin/dashboard',{admin:true,adminInfo:req.user,
           WeeklySales: JSON.stringify(updatedWeeklySales),
           YearlySales: JSON.stringify(YearlySales),
           MonthlySales: JSON.stringify(updatedMonthlySales),
           TotalSales,OrderCount,AllUsers,
      });
      
    } catch (error) {
         console.error('Error fetching sales report:', error);
         throw error;
    }
});





//Display Admin Login
const getAdminLogin = asyncHandler( async (req,res) => {
   res.render('admin/adminLogin',{admin:true,adminlogin:true,bodycss:'/css/login_signup.css'});
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

