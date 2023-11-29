const asyncHandler = require('express-async-handler');
const Product = require('../models/productModel');
const Brand = require('../models/brandModel');;
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
   res.render('admin/dashboard',{admin:true,adminInfo:req.user});
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


/*

 const uniqueFilters = await Product.aggregate([
               { $match: { gender: "women" } },
               {
                  $lookup: {
                      from: 'brands', // Adjust to the actual name of your brand collection
                      localField: 'brand',
                      foreignField: '_id',
                      as: 'brand',
                  },
              },
              {
                  $lookup: {
                      from: 'categories', // Adjust to the actual name of your brand collection
                      localField: 'category',
                      foreignField: '_id',
                      as: 'category',
                     },
               }, 
               { $unwind: "$brand" },
               { $unwind: "$category" },
               {
                 $group: {
                   _id: null,
                   categories: { $addToSet: "$category.category" },
                   brands: { $addToSet: "$brand.brand" },
                   sizes: { $addToSet: "$sizes.size" },
                   prices: { $addToSet: "$price" },
                   discounts: { $addToSet: "$discount" },
                   materials: { $addToSet: "$moreProductInfo.material" },
                   types: { $addToSet: "$moreProductInfo.type" },
                   occasions: { $addToSet: "$moreProductInfo.occasion" },
                   patterns: { $addToSet: "$moreProductInfo.pattern" },
                   necklines: { $addToSet: "$moreProductInfo.neckline" },
                   sleeves: { $addToSet: "$moreProductInfo.sleeve" },
                   fits: { $addToSet: "$moreProductInfo.fit" },
                   closures: { $addToSet: "$moreProductInfo.closure" },
                   typeOfWorks: { $addToSet: "$moreProductInfo.typeOfWork" },
                   legStyles: { $addToSet: "$moreProductInfo.legStyle" },
                   riseStyles: { $addToSet: "$moreProductInfo.riseStyle" },
                   paddings: { $addToSet: "$moreProductInfo.padding" },
                   coverages: { $addToSet: "$moreProductInfo.coverage" },
                   wirings: { $addToSet: "$moreProductInfo.wiring" },
                   count: { $sum: 1 },
                 },
               },
               {
                  $project: {
                     _id: 0,
                     
                     categories: { name: "$categories", count: "$count" },
                     brands: { name: "$brands", count: "$count" },
                     sizes: { name: "$sizes", count: "$count" },
                     prices: { name: "$prices", count: "$count" },
                     discounts: { name: "$discounts", count: "$count" },
                     materials: { name: "$materials", count: "$count" },
                     types: { name: "$types", count: "$count" },
                     occasions: { name: "$occasions", count: "$count" },
                     patterns: { name: "$patterns", count: "$count" },
                     necklines: { name: "$necklines", count: "$count" },
                     sleeves: { name: "$sleeves", count: "$count" },
                     fits: { name: "$fits", count: "$count" },
                     closures: { name: "$closures", count: "$count" },
                     typeOfWorks: { name: "$typeOfWorks", count: "$count" },
                     legStyles: { name: "$legStyles", count: "$count" },
                     riseStyles: { name: "$riseStyles", count: "$count" },
                     paddings: { name: "$paddings", count: "$count" },
                     coverages: { name: "$coverages", count: "$count" },
                     wirings: { name: "$wirings", count: "$count" },
                  },
                },
             ]);
         console.log(uniqueFilters)    

        

         function getUniqueSet(property) {
            if(property == 'brand' || property == 'category'){
               return [...new Set(products.flatMap(product => product[property][property]))];
            }else{
               return [...new Set(products.flatMap(product => product[property]))];
            }
            
         }
         function getUniqueMore(field,property) {
            return [...new Set(products.flatMap(product => { 
               let value = product[field][property];
               return value !== undefined ? [value] : [];
            }))]
         }
          function getUniqueSet(property) {
            if(property == 'brand' || property == 'category'){
               return [...new Set(products.flatMap(product => product[property][property]))];
            }else{
               return [...new Set(products.flatMap(product => product[property]))];
            }
            
         }
         let maxPrice = Math.max.apply(0,getUniqueSet('price'));
         let minPrice = Math.min.apply(0,getUniqueSet('price'));
         const filters = {};
 
         const filterProperties = ['category', 'brand'];
         const moreProperties = ['material', 'type', 'occasion', 'pattern', 'neckline', 'sleeve', 'fit', 'closure', 'typeOfWork', 'legStyle', 'riseStyle', 'padding', 'coverage', 'wiring'];
         
         filterProperties.forEach(property => { filters[property] = getUniqueSet(property)});
         filters['size'] =  [...new Set(products.flatMap(product => Object.keys(product.sizes)))];
         filters['discount'] = [70,80,60,50,40,30,20,10];
         moreProperties.forEach(property => {
             filters[property] = getUniqueMore('moreProductInfo', property);
         });
         
         // Remove properties with empty arrays
         Object.keys(filters).forEach(key => (Array.isArray(filters[key]) && filters[key].length === 0) && delete filters[key]);


*/