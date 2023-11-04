const Product = require('../models/productModel');
const Brand = require('../models/brandModel');
const CartItem = require('../models/cartItemModel');
const Cart = require('../models/cartModel');
const Category = require('../models/categoryModel');
const { createUniqueSlug } = require('../helperfns')
const asyncHandler = require('express-async-handler');
const sharp = require('sharp');
const { exit } = require('process');
const fs = require('fs').promises;


//get a product
const getAllProducts = asyncHandler(async (req,res) => {
    try{
        const products = await Product.find().populate('brand').populate('category').lean();
        res.render('admin/products',{admin:true,products,adminInfo:req.user})
    } catch(error) {
        throw new Error(error);
    }
});

//get a product
const getProduct = asyncHandler(async (req,res) => {
    const { id } = req.params;
    try{
        const product = await Product.findById(id).populate('brand').lean();
        res.render('users/product_details',
        {bodycss:'/css/product_details.css',product,user:req.user,
        bodyjs: '/js/product_details.js'})
    } catch(error) {
        throw new Error(error);
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
    const { id } = req.params;
    try {   
        const product = await Product.findById(id).populate('brand').populate('category').lean();
        const brands = await Brand.find().lean();
        const categories = await Category.find().lean();
        const gender = ['women', 'men', 'girls', 'boys' ]
        res.render('admin/editProduct',
          {admin:true,product,brands,categories,adminInfo:req.user,gender:gender});
    } catch (error) {
        throw new Error(error)
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
        const product = await Product.findByIdAndDelete(id);
        for(key in product.images){
            await fs.unlink('uploads/'+ product.images[key]);
        }
        res.redirect('/admin/view-products');
    } catch (error) {
        throw new Error(error)
    }
});

module.exports = {
    addProduct, getProduct, getAllProducts,
    editProduct, deleteProduct, getAddProduct,
    getEditProduct,
};

/*if(req.body?.stockcounts){
    const sizes = Object.keys(req.body?.stockcounts).map((size) => {
        const stock = req.body.stockcounts[size];
        if(stock > 0){
            return {
                size: size,
                stock: Number(req.body?.stockcounts[size]),
            };
        }
        return null;
      }).filter(Boolean);
    req.body.sizes = sizes;
}

*/