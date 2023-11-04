const asyncHandler = require('express-async-handler');
const Brand = require('../models/brandModel');
const validateMongodbId = require('../utils/validateMongodbId');
const Product = require('../models/productModel');


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


//delete Brand
const deleteBrand = asyncHandler( async (req,res) => {
    const { id } = req.params;
    validateMongodbId(id);
    try{
        const brand = await Brand.findByIdAndDelete(id).lean();;
        await Product.deleteMany({ brand: brand._id });
        res.redirect('/admin/brands');
    } catch(error){
        throw new Error(error);
    }
});

//display edit brand page
const getEditBrand = asyncHandler( async (req,res) => {
  const { id } = req.params;
  validateMongodbId(id);
  try{
      const brand = await Brand.findById(id);
      res.render('admin/editBrand',{admin:true,brand,adminInfo:req.user});
  } catch(error){
      throw new Error(error);
  }
});

//edit Brand
const editBrand = asyncHandler( async (req,res) => {
  try{
      const brand = await Brand.findOneAndUpdate(req.body.id,req.body);
      res.redirect('/admin/brands')
  } catch(error){
      throw new Error(error);
  }
});


module.exports = {
    getAllBrands,
    getAddBrand,
    addBrand,
    deleteBrand,
    editBrand,
    getEditBrand,
}