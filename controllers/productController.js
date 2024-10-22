const Product = require('../models/productModel');
const Brand = require('../models/brandModel');
const Category = require('../models/categoryModel');
const CartItem = require('../models/cartItemModel');
const Cart = require('../models/cartModel');
const { createUniqueSlug } = require('../helperfns')
const asyncHandler = require('express-async-handler');
const fs = require('fs').promises;
const Review = require('../models/reviewModel');
const { cartQty,getAllBrands } = require('../helperfns');



//get a product
const getAllProducts = asyncHandler(async (req,res) => {
    const products = await Product.find().populate('brand').populate('category').lean();
    res.render('admin/products',{admin:true,products,adminInfo:req?.user,__active: 'products'})
});

const getProduct = asyncHandler(async (req, res) => {
    const slug  = req?.params,
        product = await Product.findOne(slug).populate('brand').lean(),
        user = req?.user,
        totalQty = await cartQty(user),
        reviews = await Review.find({product: product?._id}).populate('postedBy').lean(),
        userReview = await Review.findOne({product:product?._id,postedBy : user?.id}).lean(),
        totalReviews = reviews?.length,
        Brands = await getAllBrands();

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
        const index = ratingData?.findIndex(ratingItem => ratingItem?.rating === item?.rating);
        if (index !== -1) {
            ratingData[index].rating = item?.rating;
            ratingData[index].count = item?.count;
            ratingData[index].percentage = `${item?.percentage?.toFixed(2)}%`     
        }
    });

    res.render('users/product_details', { user,product,reviews,
        userReview,totalQty,ratingData,totalReviews,Brands,
        bodycss: '/css/product_details.css', bodyjs: '/js/product_details.js'
    });
});


//create a product
const addProduct = asyncHandler(async (req,res) => {    
    const { 
        material,type,occasion,pattern,neckline,sleeve,fit,
        closure,typeOfWork,legStyle,riseStyle,padding,coverage,
        wiring,careInstructions,packContains 
       }  = req?.body;
       
    const moreProductInfo = {
        material, type, occasion, pattern, neckline, sleeve, fit,
        closure, typeOfWork, legStyle, riseStyle, padding, coverage,
        wiring, careInstructions, packContains
    };
    
    req.body.sizes = JSON.parse(req?.body?.sizeData)
    req.body.moreProductInfo = moreProductInfo;
    if(req?.body?.title) req.body.slug = await createUniqueSlug(req?.body?.title);

    await Product.create(req?.body);
    res.redirect('/admin/view-products');
});


//Display Add product-page
const getAddProduct = asyncHandler( async (req,res) => {
    const categories = await Category.find().lean();
    const brands = await Brand.find().lean();
    res.render('admin/addProducts',{admin:true,categories,brands,adminInfo:req?.user});
});


//Update a product
const getEditProduct = asyncHandler(async (req,res) => {
    const  slug  = req.params, 
        product = await Product.findOne(slug).populate('brand').populate('category').lean(),
        brands = await Brand.find().lean(),
        categories = await Category.find().lean(),
        gender = ['women', 'men', 'girls', 'boys' ];

    res.render('admin/editProduct',
      {admin:true,product,brands,categories,adminInfo:req?.user,gender:gender});
});


//Update a product
const editProduct = asyncHandler(async (req,res) => {

    try{
        let slug = req?.query.slug
        console.log(slug,"ekndj")
        let selectedImg = JSON.parse(req?.body?.selectedImg);

        let existingProduct = await Product.findOne({ slug });
        if(req?.body){
            const propertiesToExtract = [
                'material', 'type', 'occasion', 'pattern', 'neckline', 'sleeve', 'fit',
                'closure', 'typeOfWork', 'legStyle', 'riseStyle', 'padding', 'coverage',
                'wiring', 'careInstructions', 'packContains'
            ];  
        
            propertiesToExtract?.forEach(property => {
                const field = req?.body[property];
                if(field){
                    existingProduct.moreProductInfo[property] = (field !== '') ? field : undefined;
                    delete req.body[field];
                }  
            });      
           
            if (req?.body?.sizeData) {
                existingProduct.sizes = JSON.parse(req.body.sizeData);
            }

            if(req.body?.title){
                existingProduct.title = req?.body?.title;
                existingProduct.slug = await createUniqueSlug(req?.body?.title);
                delete req?.body?.title;
            }

            if (selectedImg) {      
                
                let values = {};
                if(existingProduct?.images) values = { ...existingProduct?.images };
                
                for (const img of selectedImg) {
                    let imagePath;

                    if(existingProduct?.images){
                        const existImg = existingProduct?.images?.hasOwnProperty(img);
                        const newFile = req?.body?.images?.hasOwnProperty(img)

                        if ( existImg && newFile) {
                            //Already existing file, replace
                            try {                        
                                await fs.unlink('uploads/' + existingProduct?.images[img]);
                            } catch (err) {
                                if (err) {
                                    console.log(`File does not exist or something else`);
                                }
                            }

                        } else if ((!existImg && !newFile) || !newFile) {
                            continue;
                        }
                    }

                    imagePath = `${Date.now()}-processed.webp`;
                    values[img] = imagePath;

                    await fs.writeFile('uploads/' + imagePath, req?.body?.images[img], (err) => {
                        if(err){
                            console.error(`Error writing file: ${err.message}`);
                            return res.status(404).json({ message: `Error writing file: ${err.message}` });
                        }
                    });
                }
            
                for (const key in existingProduct?.images) {
                    if (!selectedImg.includes(key)) {
                        try {                        
                            await fs.unlink('uploads/' + existingProduct?.images[key]);
                        } catch (err) {
                            if (err) {
                                console.log(`File does not exist or something else`);
                            }
                        }
                        delete values[key];
                    }
                }
                existingProduct.images = values;
                delete req.body.images;
            } else {
                return res.status(422).json({ message: `Product should have images!` })
            }
                   
            for (const key in req?.body) {
                existingProduct[key] = req?.body[key];
            }
        }
        await existingProduct?.save();
        if(req.body?.mrp || req.body?.discount){
           let cartItemIds = await CartItem.find({product: existingProduct?.id}).distinct('_id');

           const carts = await Cart.find({ 'items.cartItem': { $in: cartItemIds } });
           for (const item of carts){ await item.save();}
           
        } 
        res.status(200).json({ message: "Updated successfully", redirect: "/admin/view-products" });
    } catch(error){
        console.log(error)
        res.status(400).json({ message: "Somethings has happened"});
    }
    
});


//Delete a product
const deleteProduct = asyncHandler(async (req,res) => {
    const { id } = req?.params,
        product = await Product.findByIdAndUpdate(id,{isDeleted:true});

    if (!product) {
        return res.status(404).json({ message: 'Product not found' });
    }
    await product?.save();
    res.redirect('/admin/view-products');
});


//Retrieve the deleted  product
const restoreProduct = asyncHandler(async (req,res) => {
    const { slug } = req?.params,
        product = await Product.findOne({slug,isDeletedBy:false});

    product.isDeleted = false;
    if (!product) {
        return res.status(404).json({ message: 'Product not found' });
    }
    await product?.save();
    res.redirect('/admin/view-products');
});


module.exports = {
    addProduct, getProduct, getAllProducts,
    editProduct, deleteProduct, getAddProduct,
    getEditProduct, restoreProduct,
};

/* /*for(key in product.images){
       await fs.unlink('uploads/'+ product.images[key]);
}*/
