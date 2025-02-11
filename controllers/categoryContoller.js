const asyncHandler = require('express-async-handler');
const Category = require('../models/categoryModel');
const validateMongodbId = require('../utils/validateMongodbId');
const Product = require('../models/productModel');


//get Category Page in admin side
const getAllCategories = asyncHandler (async (req, res) => {
    const categories = await Category.find().lean();
    res.render('admin/category',{admin:true,categories,adminInfo:req?.user,__active: 'categories'})
});

//add Categories 
const getAddCategory = asyncHandler (async (req, res) => {
    res.render('admin/addCategory',{admin:true,adminInfo:req.user })
});

//add Categories 
const addCategory = asyncHandler (async (req, res) => {
    const existCategory = await Category.findOne(
      { category: new RegExp('^' + req?.body?.category + '$', 'i')});
      
    if (existCategory) {
        req.flash("error_msg", `${req?.body?.category} already exists!`);
        return res.redirect('add-category');
        // return res.status(400).json({ error: "Category already exists" });
    }
    const categories = await Category.create(req?.body);
    req.flash("success_msg", `${req?.body?.category} added successfully!`);
    res.redirect('add-category');
});



//display edit Category page
const getEditCategory = asyncHandler( async (req,res) => {
   const { id } = req?.params;
   validateMongodbId(id);
   const category = await Category.findById(id).lean();
   res.render('admin/editCategory',{admin:true,category,adminInfo:req?.user});

});

//edit Category 
const editCategory = asyncHandler( async (req,res) => {
    const existCategory = await Category.findOne(
      { category: new RegExp('^' + req?.body?.category + '$', 'i')});
      
    if(!existCategory){
       const category = await Category.findOneAndUpdate(req?.body?.id,req?.body);
    } 
    
    res.redirect('/admin/categories')
});

//delete Category 
const deleteCategory = asyncHandler( async (req,res) => {
    const { id } = req?.params;
    validateMongodbId(id);
    const category = await Category.findByIdAndUpdate(id,{isDeleted:true});
    await Product.updateMany({ category, isDeleted:false},
        {$set : {isDeletedBy:true}});
    res.redirect('/admin/categories');
});

const restoreCategory = asyncHandler( async (req,res) => {
    const { id } = req?.params;
    validateMongodbId(id);

    const category = await Category.findByIdAndUpdate(id,
        {isDeleted:false},{ new: true });
    
    const products = await Product.find({
        category: category?._id,
        isDeleted: false,
    }).populate({
        path: 'brand',
        match: { isDeleted: false }, // Check the isDeleted field of the Brand model
    }).exec();
    
    // Update isDeletedBy field for the fetched products
    products?.forEach(async (product) => {
        if (product?.brand && product?.brand?.isDeleted === false) {
            product.isDeletedBy = false;
            await product?.save();
        }
    });

    res.redirect('/admin/categories');
});


module.exports = {
    getAllCategories,
    getAddCategory,
    addCategory,
    deleteCategory,
    editCategory,
    getEditCategory,
    restoreCategory,
}