const asyncHandler = require('express-async-handler');
const Brand = require('../models/brandModel');
const Product = require('../models/productModel');
const Category = require('../models/categoryModel');
const WishList = require('../models/wishListModel');
const { cartQty, filterFunction } = require('../helperfns');


const filterProducts = asyncHandler( async(req,res)=> {
    let { _page, _main, category, sizes, brand, discount, minRange, maxRange, sorting} = req.query, 
        pipeline =  {isDeleted:false, isDeletedBy:false},sort,
        selectedOptions = req?.query,
        pagination = parseInt(req?.query?.pagination) || 1,
        pageSize = parseInt(req?.query?.pageSize) || 10,
        skipPage = (pagination - 1) * pageSize;
    
    let user = req?.user, totalQty = await cartQty(user);
    const allBrands = await Brand.find({isDeleted:false}).distinct('brand');
    const Brands = allBrands.sort();
    
    let properties = ['material', 'type','occassion', 'pattern', 'neckline',
        'typeOfWork', 'legStyle', 'riseStyle', 'padding', 'coverage', 'wiring'];
    
    if(_page == 'gender') {
        if(_main=='girls' || _main=='boys') selectedOptions['gender'] = _main;
        pipeline['gender'] = (_main === 'kids')? {$in: ["girls", "boys"]}:_main;
    }else if(_page == 'brand'){
        const br = await Brand.findOne({ brand: _main });
        pipeline['brand'] = br?._id;
    } 

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

    if(req?.query?.gender){
        pipeline['gender'] = {$in:  req?.query?.gender };
    }
    
    for (const item in selectedOptions) {     
        if(properties.includes(item)){
            pipeline[`moreProductInfo.${item}`] = {$in:selectedOptions[item] }
        } 
    }

    if(minRange && maxRange) {
        pipeline['price'] = { $gte: Number(minRange) , $lte: Number(maxRange) }
    }
    
    if (sorting) {
        const sortOptions = {
            latest: { createdAt: -1 },
            best_rating: { rating: -1 },
            price_low_to_high: { price: 1 },
            price_high_to_low: { price: -1 },
            discount_high_to_low: { discount: -1 },
        };
    
        const option = selectedOptions['sorting'];
        sortField = sortOptions[option];
        sort = { $sort: sortField };
    }

    const all = await Product.countDocuments(pipeline);

    const totalPages = Math.ceil( all / pageSize);
    const startPage = Math.max(1, (pagination+1) - Math.ceil(pageSize / 2));
    const endPage = Math.min(totalPages, startPage + pageSize - 1);
    const paginationLinks = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
    

    let products = await Product.aggregate([{$match: pipeline},sort,
        { $lookup: { from: 'brands', localField: 'brand', foreignField: '_id', as: 'brand' } },
        { $unwind: '$brand' } ,
        { $skip: skipPage },
        { $limit: pageSize },
    ]);

    let { filters, pageFilter, renderPage, priceStats } = await filterFunction(_page, _main, pipeline, false );
    
    if(_page == 'brand' ) pageFilter = {brand: pageFilter};
  
    let fromOrder = skipPage + 1;
        let toOrder = fromOrder + pageSize - 1;
        if(toOrder > all) toOrder = all;

    
    if(discount) selectedOptions['discount'] = selectedOptions['discount']?.map(item => `${item}% And Above`);
    
    res.render(renderPage,{main:pageFilter, products, user, 
          totalQty, Brands, filters,  priceStats ,selectedOptions,
          fromOrder, toOrder, pageSize, paginationLinks, pagination, endPage,
          bodycss:'/css/nav_footer.css',bodyjs:'/js/productCard.js',
        maincss:'/css/category_page.css',});  
}); 


const selectMenu = asyncHandler(async (req, res) => {
    try {
        const { gender } = req?.query;

        const categories = await Product.aggregate([
            { $match: { gender } },
            {
                $lookup: {
                    from: 'categories', // Use the correct collection name for categories
                    localField: 'category',
                    foreignField: '_id',
                    as: 'categoryInfo',
                },
            },
            { $unwind: '$categoryInfo' }, // Unwind the category array
            {
                $group: {
                    _id: null,
                    distinctTitles: { $addToSet: '$title' },
                    distinctCategories: { $addToSet: '$categoryInfo.category' },
                },
            },
            {
                $project: {
                    _id: 0,
                    distinctNames: { $setUnion: ['$distinctTitles', '$distinctCategories'] },
                },
            },
        ]);
        res.status(200).json({categories: categories[0]?.distinctNames});
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


const searchText = asyncHandler(async (req, res) => {
    try {
        const { gender, searchVal } = req?.query;
        let user = req?.user, totalQty = await cartQty(user);
        const allBrands = await Brand.find({isDeleted:false}).distinct('brand');
        const Brands = allBrands.sort();
  
        const wishlist = new Set(
          (await WishList.findOne({ user: req?.user?.id }).distinct('products').lean() || []).map((id) =>
              id.toString()
          )
        );
    
        const products = await Product.aggregate([
          {
            $match: { gender },
          },
          {
            $lookup: {
              from: 'categories', // Assuming the name of the category collection is 'categories'
              localField: 'category',
              foreignField: '_id',
              as: 'categoryInfo',
            },
          },
          { $unwind: '$categoryInfo' },
          {
            $match: {
              $or: [
                { title: searchVal},
                { 'categoryInfo.category': { $regex: new RegExp(searchVal, 'i') } },
              ],
            },
          },
        ]);

         // Add a property 'isInWishlist' to each product
         products.forEach(product => {
            product.isInWishlist = wishlist.has(product._id.toString());
        });
        
  
        res.render('users/search', { products, search: searchVal, gender, totalQty, Brands, wishlist,
           bodycss: '/css/category_page.css', bodyjs: 'js/productCard.js' });
    } catch (error) {
      console.error('An unexpected error occurred:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  


module.exports = { 
    filterProducts, selectMenu, searchText }



 /*if(sorting){
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
    }*/