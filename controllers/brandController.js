const asyncHandler = require('express-async-handler');
const Brand = require('../models/brandModel');
const validateMongodbId = require('../utils/validateMongodbId');
const Product = require('../models/productModel');
const { cartQty, genderBrandFilter } = require('../helperfns');



//get a brand 
const getBrand = asyncHandler( async(req,res) => {
    const { brand } = req.query;
    try {
        const brandSelected = await Brand.findOne({ brand }).lean();
        await genderBrandFilter('brand', brandSelected, req, res);      
    } catch (error) {
        console.log(error);
        res.status(500).json({error:"Something went wrong!"})

    }        
});

//get Brand Page 
const getAllBrands = asyncHandler (async (req, res) => {
    try{
         const brands = await Brand.find().lean();
         res.render('admin/brand',{admin:true,brands,adminInfo:req.user})
    } catch(error) {
         throw new Error(error);
    }
});

//add Brands
const getAddBrand = asyncHandler (async (req, res) => {
      res.render('admin/addBrand',{admin:true,adminInfo:req.user })
});

//add Brands
const addBrand = asyncHandler (async (req, res) => {
  try{
      const existBrand = await Brand.findOne(
        { Brand: new RegExp('^' + req.body.brand + '$', 'i')});
        
      if (existBrand) {
          return res.status(400).json({ error: "Brand already exists" });
      }
       const brands = await Brand.create(req.body);
       res.redirect('add-brand');
  } catch(error) {
       throw new Error(error);
  }
});



//display edit brand page
const getEditBrand = asyncHandler( async (req,res) => {
  const { id } = req.params;
  validateMongodbId(id);
  try{
      const brand = await Brand.findById(id).lean();
      res.render('admin/editBrand',{admin:true,brand,adminInfo:req.user});
  } catch(error){
      throw new Error(error);
  }
});

//edit Brand
const editBrand = asyncHandler( async (req,res) => {
  try{
    const { brandId } = req?.body;
    console.log(req.body.brand)
      const brand = await Brand.updateOne({_id: brandId},req.body);
      console.log(brand)
      res.redirect('/admin/brands')
  } catch(error){
      throw new Error(error);
  }
});

//delete Brand
const deleteBrand = asyncHandler( async (req,res) => {
    const { id } = req.params;
    validateMongodbId(id);
    try{
        const brand = await Brand.findByIdAndUpdate(id,{isDeleted:true});
        await Product.updateMany({ brand, isDeleted:false},
            {$set : {isDeletedBy:true}});
        res.redirect('/admin/brands');
    } catch(error){
        throw new Error(error);
    }
});

const restoreBrand = asyncHandler( async (req,res) =>{
    const { id } = req.params;
    validateMongodbId(id);
    try{
        const brand = await Brand.findByIdAndUpdate(id,
            {isDeleted:false},{ new: true });
         const products = await Product.find({brand: brand._id,isDeleted: false})
         .populate({path: 'category', match: { isDeleted: false }}).exec();
        
            // Update isDeletedBy field for the fetched products
        products.forEach(async (product) => {
            if (product.category && product.category.isDeleted === false) {
                product.isDeletedBy = false;
                await product.save();
            }
        });
        res.redirect('/admin/categories');
    } catch(error){
        throw new Error(error);
    }
});


module.exports = {
    getBrand,
    getAllBrands,
    getAddBrand,
    addBrand,
    deleteBrand,
    editBrand,
    getEditBrand,
    restoreBrand,
}