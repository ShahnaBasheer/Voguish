const Product = require('../models/productModel');
const Brand = require('../models/brandModel');
const Category = require('../models/categoryModel');
const { createUniqueSlug } = require('../helperfns')
const asyncHandler = require('express-async-handler');
const fs = require('fs').promises;
const Review = require('../models/reviewModel');
const { cartQty } = require('../helperfns');
const { validateMongodbId } = require('../utils/validateMongodbId');
const CartItem = require('../models/cartItemModel')


//get a product
const getAllProducts = asyncHandler(async (req,res) => {
    try{
        const products = await Product.find().populate('brand').populate('category').lean();
        res.render('admin/products',{admin:true,products,adminInfo:req.user})
    } catch(error) {
        throw new Error(error);
    }
});

const getProduct = asyncHandler(async (req, res) => {
    const slug  = req.params;
    try {
        const product = await Product.findOne(slug).populate('brand').lean();
        const user = req.user, totalQty = await cartQty(user);
        const reviews = await Review.find({product: product?._id}).populate('postedBy').lean();
        const userReview = await Review.findOne({product:product._id,postedBy : user?.id}).lean();
        const totalReviews = reviews.length;

        const reviewsData = await Review.aggregate([
            { $match: { product: product._id } },
            { $group: { _id: '$rating', count: { $sum: 1 } } },
            { $addFields: { percentage: { $multiply: [
                        { $divide: ['$count', totalReviews] }, 100] }
                }
            },
            { $project: { _id: 0, rating: '$_id', count: 1, percentage: 1 } }
        ]);
        const ratingData = [
            {rating:5, count: 0, percentage: "0%", color: 'success'},
            {rating:4, count: 0, percentage: "0%", color: 'primary'},
            {rating:3, count: 0, percentage: "0%", color: 'info'},
            {rating:2, count: 0, percentage: "0%", color: 'warning'},
            {rating:1, count: 0, percentage: "0%", color: 'danger'},
        ]
        
        reviewsData.forEach(item => {
            const index = ratingData.findIndex(ratingItem => ratingItem.rating === item.rating);
            if (index !== -1) {
                ratingData[index].rating = item.rating;
                ratingData[index].count = item.count;
                ratingData[index].percentage = `${item.percentage.toFixed(2)}%`     
            }
        });

        res.render('users/product_details', { user,product,reviews,
            userReview,totalQty,ratingData,totalReviews,
            bodycss: '/css/product_details.css', bodyjs: '/js/product_details.js'
        });
    } catch (error) {
        console.log(error)
        res.status(500).send('Internal Server Error');
    }
});

//create a product
const addProduct = asyncHandler(async (req,res) => {    
    try{
        const { 
            material,type,occasion,pattern,neckline,sleeve,fit,
            closure,typeOfWork,legStyle,riseStyle,padding,coverage,
            wiring,careInstructions,packContains 
           }  = req.body;
           
        const moreProductInfo = {
            material, type, occasion, pattern, neckline, sleeve, fit,
            closure, typeOfWork, legStyle, riseStyle, padding, coverage,
            wiring, careInstructions, packContains
        };
        
        req.body.sizes = JSON.parse(req.body.sizeData)
        req.body.moreProductInfo = moreProductInfo;
        if(req.body.title) req.body.slug = await createUniqueSlug(req.body.title);

        const newProduct = await Product.create(req.body);
        res.redirect('/admin/view-products');
    } catch(error) {
        throw new Error(error);
    }  
});

//Display Add product-page
const getAddProduct = asyncHandler( async (req,res) => {
    try{
       const categories = await Category.find().lean();
       const brands = await Brand.find().lean();
       res.render('admin/addProducts',{admin:true,categories,brands,adminInfo:req.user});
    } catch (error){
        throw new Error(error);
    }
});

//Update a product
const getEditProduct = asyncHandler(async (req,res) => {
    const  slug  = req.params;
    try {   
        const product = await Product.findOne(slug).populate('brand').populate('category').lean();
        const brands = await Brand.find().lean();
        const categories = await Category.find().lean();
        const gender = ['women', 'men', 'girls', 'boys' ]
        res.render('admin/editProduct',
          {admin:true,product,brands,categories,adminInfo:req.user,gender:gender});
    } catch (error) {
       console.log(error)
    }
});

//Update a product
const editProduct = asyncHandler(async (req,res) => {
    let { slug } = req.params;
    try {
        let existingProduct = await Product.findOne({ slug });
        if(req.body){
            const propertiesToExtract = [
                'material', 'type', 'occasion', 'pattern', 'neckline', 'sleeve', 'fit',
                'closure', 'typeOfWork', 'legStyle', 'riseStyle', 'padding', 'coverage',
                'wiring', 'careInstructions', 'packContains'
            ];
            
            propertiesToExtract.forEach(property => {
                const field = req.body[property];
                if (field !== undefined) {
                    existingProduct.moreProductInfo[property] = field !== '' ? field : undefined;
                    delete field;
                }
            });        
           
            if (req.body?.sizeData) {
                existingProduct.sizes = JSON.parse(req.body.sizeData);
            }
            if (req.body?.images) {
                for (const key in req.body.images) {
                    await fs.writeFile('uploads/' + existingProduct.images[key], req.body.images[key]);
                }
                delete req.body.images;
            }        
            if(req.body?.title){
                existingProduct.title = req.body.title;
                existingProduct.slug = await createUniqueSlug(req.body.title);
                delete req.body.title;
            }
            for (const key in req.body) {
                existingProduct[key] = req.body[key];
            }
        }
        await existingProduct.save();
        if(req.body?.mrp || req.body?.discount){
           //let cartitem = await CartItem.find({product: existingProduct.id});
           //let cart = await Cart.find({items})
           //await cartitem.save();
        } 
       res.json({ message: "Updated successfully", redirect: "/admin/view-products" });
    } catch (error) {
        console.log(error)
        throw new Error(error)
    }
});

//Delete a product
const deleteProduct = asyncHandler(async (req,res) => {
    const { id } = req.params;
    try {
        const product = await Product.findByIdAndUpdate(id,{isDeleted:true});
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        await product.save();
        res.redirect('/admin/view-products');
    } catch (error) {
        throw new Error(error)
    }
});

//Retrieve the deleted  product
const restoreProduct = asyncHandler(async (req,res) => {
    const { slug } = req.params;
    try {
        const product = await Product.findOne({slug,isDeletedBy:false});
        product.isDeleted = false;
        console.log(product)
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        await product.save();
        res.redirect('/admin/view-products');
    } catch (error) {
        throw new Error(error)
    }
});


module.exports = {
    addProduct, getProduct, getAllProducts,
    editProduct, deleteProduct, getAddProduct,
    getEditProduct, restoreProduct,
};

/* /*for(key in product.images){
       await fs.unlink('uploads/'+ product.images[key]);
}*/
