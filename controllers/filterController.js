const asyncHandler = require('express-async-handler');
const Brand = require('../models/brandModel');
const Product = require('../models/productModel');
const Category = require('../models/categoryModel');
const { cartQty, filterFunction } = require('../helperfns');


const filterProducts = asyncHandler( async(req,res)=> {
    let { _page, _main, category, sizes, brand, discount, minRange, maxRange, sorting} = req.query, 
        pipeline =  {isDeleted:false, isDeletedBy:false},sort,
        selectedOptions = req.query;

    let user = req?.user, totalQty = await cartQty(user);
    const allBrands = await Brand.find({isDeleted:false}).distinct('brand');
    const Brands = allBrands.sort();
    
    let properties = ['material', 'type','occassion', 'pattern', 'neckline',
        'typeOfWork', 'legStyle', 'riseStyle', 'padding', 'coverage', 'wiring'];
    
    if(_page == 'gender') {
        if(_main=='girls' || _main=='boys') selectedOptions['gender'] = _main;
        pipeline['gender'] = (_main === 'kids')? {$in: ["girls", "boys"]}:_main;
    }else if(_page == 'brand') pipeline['brand'] = _main;
    
    if (category) {
        const cat = await Category.distinct('_id', { category: { $in: category } });
        pipeline['category'] = { $in: cat };
    }

    if (brand && _page === 'gender') {
        const br = await Brand.distinct('_id', { brand: { $in: brand } });
        pipeline['brand'] = { $in: br };
    }

    if(discount){ 
        let max = Math.max.apply(0,discount.map(Number));
        pipeline['discount'] =  { $gte: max };
    }
    
    if(sizes){ 
        sizes.forEach(size => {
            pipeline[`sizes.${size}`] = { $exists: true };
       });
    }

    
    for (const item in selectedOptions) {     
        if(properties.includes(item)){
            pipeline[`moreProductInfo.${item}`] = {$in:selectedOptions[item] }
        } 
    }

    if(minRange && maxRange) {
        pipeline['price'] = { $gte: Number(minRange) , $lte: Number(maxRange) }
    }
    
    if(sorting){
        let option = selectedOptions['sorting'], sortField;
        if( option == 'latest'){
            sortField = { 'createdAt' : -1 };
        } else if( option == 'best_rating'){
            sortField = { 'rating' : -1};
        } else if( option == 'price_low_to_high'){
            sortField = { 'price' : 1};
        } else if( option == 'price_high_to_low'){
            sortField = { 'price' : -1 };
        } else if( option == 'discount_high_to_low'){
            sortField = { 'discount' : -1 };
        }
        sort = { $sort:  sortField } ;
    }
    
    let products = await Product.aggregate([{$match: pipeline},sort,
        { $lookup: { from: 'brands', localField: 'brand', foreignField: '_id', as: 'brand' } },
        { $unwind: '$brand' } 
    ]);

    let { filters, pageFilter, renderPage, priceStats } = 
         await filterFunction(_page, _main, pipeline, false );
    
    if(discount) selectedOptions['discount'] = selectedOptions['discount']?.map(item => `${item}% And Above`);
    
    res.render(renderPage,{main:pageFilter, products, user, 
          totalQty, Brands, filters,  priceStats ,selectedOptions,
          bodycss:'/css/nav_footer.css',bodyjs:'/js/productCard.js',
        maincss:'/css/category_page.css',});  
}); 


module.exports = { filterProducts }

