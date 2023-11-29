const slugify = require('slugify');
const shortid = require('shortid');
const Product = require('./models/productModel');
const Brand = require('./models/brandModel');
const otpGenerator = require('otp-generator');
const sendEmail = require('./utils/sendMail');
const User = require('./models/userModel');
const Cart = require('./models/cartModel');
const CartItem = require('./models/cartItemModel');



const createUniqueSlug = async (title) => {
  try{
      let slug = slugify(title)
      let existingProduct = await Product.findOne({ slug });
      
      while (existingProduct) {
          let slugId = shortid.generate();
          slug = `${slug}-${slugId}`;
          existingProduct = await Product.findOne({ slug });
      }  
      return slug;
  }catch(error){
    console.log(error);
  } 
}

const otpEmailSend = async (req,userCreate,oldEmail) => {
  try{
      const otp =  otpGenerator.generate(6, {specialChars: false });
      req.body.otp =  otp;
      req.body.otpTimestamp = new Date();

      const subject = "OTP Verification";
      const text = `Your OTP for email verification is: ${otp}`;
      if(userCreate){
         await User.create(req.body);
      }else if(userCreate == "profile_setting"){
        await sendEmail(oldEmail, subject, text);
      }else{
          await User.updateOne(
            { email:req.body.email },
            { $set: { otp, otpTimestamp: new Date() } }
          );
      }
      await sendEmail(req.body.email, subject, text);
  }catch(error){
      console.log("problem with sending email")
      console.log(error);
      throw Error
  }
};

const generateOrderId = () => {
  const prefix = 'ORD'; // Order ID prefix
  const uniqueNumber = Math.floor(Math.random() * 10000); // Generate a random number
  const timestamp = Date.now(); // Get current timestamp
  const orderId = `${prefix}-${uniqueNumber}-${timestamp}`; // Combine prefix, random number, and timestamp
  return orderId;
};

const findCart = async (user) => {
  const cart = await Cart.findOne({ user: user?._id })
    .populate({
        path: 'user',
        model: 'User' 
    })
    .populate({
        path: 'items.cartItem',
        populate: {
            path: 'product',
            model: 'Product'
        }
    }).lean()
    if(cart) return cart
    return 0;
}

const cartQty = async (user) => {
    cartDetails = await findCart(user);
    let qty = 0;
    if (cartDetails) {
       qty = cartDetails.items.reduce((total, cartitem) => total + cartitem.quantity, 0);
    }
    return qty;
}


const selectCartItem = async( slug, req ) => {
    try {
        const product = await Product.findOne({ slug });
        const existingCart = await Cart.findOne({user:req.user});
        let selectSize,selectColor;
      
        if (!product) return res.status(404).json({ message: 'Product not found' });        
      
        const validOptionFound = Array.from(product.sizes.keys()).some(size => {
            const availableColor = product.sizes.get(size).find(item => item.stock > 0);
            if (availableColor) {
                selectSize = size;
                selectColor = availableColor.color;
                return true; // Exit the loop if a valid option is found
            }
            return false;
        });
        if (!validOptionFound) {
            return res.status(400).json({ message: 'Product is out of stock!' });
        }    
        let item = { 
            product: product._id, 
            size: req.query.size || selectSize, 
            color:  req.query.color || selectColor, 
        }
        let cartItemExist = await CartItem.findOne(item);
      
        if (!cartItemExist) {
            const newCartItem = new CartItem(item);
            await newCartItem.save();
            cartItemExist = newCartItem; 
        }
         
        if (!existingCart) {
            const newCart = new Cart({ user: req.user?._id, items: [{ cartItem: cartItemExist._id, quantity: req.query.qty || 1 }] });
            await newCart.save();
        } else {
            let index;
            let itemExist = existingCart.items.some((item,i) =>{
                index =  i;
                return item.cartItem.toString() === cartItemExist._id.toString()
            });
            if(!itemExist){
                existingCart.items.push({ cartItem: cartItemExist._id, quantity: req.query.qty || 1 });
            }else existingCart.items[index].quantity++;
            await existingCart.save();
        }
    } catch (error) {
        console.log(error);
    }
   
}

const genderBrandFilter = async(page, filter, req, res) => {
    try {
        let user = req?.user, totalQty = await cartQty(user);
        const allBrands = await Brand.find({isDeleted:false}).distinct('brand');
        const Brands = allBrands.sort();  

        let { filters, matchStage , pageFilter, renderPage, priceStats } = 
             await filterFunction(page, filter);

        const products = await Product.find(matchStage)
            .populate('brand').populate('category').lean();     
  
        return res.render(renderPage,{main:pageFilter, products, user, 
            totalQty, Brands, filters, priceStats,
            bodycss:'css/nav_footer.css',bodyjs:'js/productCard.js',
            maincss:'css/category_page.css',});  
    } catch (error) {
        console.log(error);
    }
        
}  


const filterFunction = async(page,pageFilter, matchStage = '', isGetFilterPage = true) => {
    try {
        let filters = {}, pageField, renderPage,
            categoryMatch = { isDeleted:false, isDeletedBy:false },
            properties = ['gender', 'category', 'brand', 'sizes' , 'discount', 'material',
                    'type','occassion', 'pattern', 'neckline','typeOfWork', 'legStyle',
                    'riseStyle', 'padding', 'coverage', 'wiring'];

        if(page == 'gender'){
            renderPage = 'users/category_page';
            pageField = (pageFilter === 'kids')? {$in: ["girls", "boys"]}:pageFilter;
            categoryMatch['gender'] = pageField;
            matchStage = (isGetFilterPage)?{ gender:pageField, isDeleted:false, isDeletedBy:false }: matchStage;
        } else if(page == 'brand'){
            renderPage = 'users/brand';
            properties.splice(1, 1);
            categoryMatch['brand'] = pageFilter._id;
            matchStage = (isGetFilterPage)?{brand:pageFilter._id,isDeleted:false, isDeletedBy:false }: matchStage;
        }

        // Use Promise.all to wait for all promises to resolve
        const propertyPromises = properties.map(async (property) => {
            return {[property]: await getFieldCounts(property, matchStage, categoryMatch)  } 
        });
  
        const resolvedProperties = await Promise.all(propertyPromises);
            resolvedProperties.forEach((propertyObject) => {
              const key = Object.keys(propertyObject)[0];
                  filters[key] = propertyObject[key];
              });
        
        // Remove properties with empty arrays
        Object.keys(filters).forEach(key => {
            (Array.isArray(filters[key]) && filters[key].length === 0) && delete filters[key];         
        });
        
        let pr = matchStage?.price;
        let priceStats = (await getFieldCounts('price', matchStage))[0];
        if(priceStats){
            priceStats['min'] = (pr)?pr.$gte:priceStats?.minPrice;
            priceStats['max'] = (pr)?pr.$lte:priceStats?.maxPrice;               
        }  
        return { filters, pageFilter, renderPage, priceStats, matchStage };
    } catch (error) {
        console.log(error);
    }
};


const getFieldCounts = async (fieldName, matchStage, categoryMatch) => {
    try {
        let pipeline;
        if(fieldName === 'gender'){
             pipeline = [
                { $match: matchStage},
                { $group: { _id: '$gender', count: { $sum: 1 } } },
                { $project: {_id: 0, name: `$_id`,count: 1 } },
             ]
             console.log(await Product.aggregate(pipeline))
        } else if (fieldName === 'category' || fieldName === 'brand') {
          pipeline = [
              { $match: (fieldName === 'category')?categoryMatch:matchStage },
              {
                $lookup: {
                    from: fieldName === 'category' ? 'categories' : 'brands',
                    localField: `${fieldName}`,
                    foreignField: '_id',
                    as: `${fieldName}`,
                },
              },
              { $unwind: `$${fieldName}`,},
              { $group: { _id: `$${fieldName}.${fieldName}`,count: { $sum: 1 },},},
              { $project: {_id: 0,name: `$_id`,count: 1 } }
          ];
        } else if (fieldName === 'sizes') {
          pipeline = [
              { $match: matchStage },
              { $set: { sizesArray: { $objectToArray: `$${fieldName}` } } },
              { $unwind: "$sizesArray" },
              { $group: { _id: "$sizesArray.k", count: { $sum: 1 } } },
              { $project: { _id: 0, name: "$_id", count: 1 } },
          ];
        } else if (fieldName === 'discount'){
            const matchDiscount = matchStage?.discount?.$gte; // Assuming discount is a numeric value
            const discountValue = matchDiscount
            ? { $and: [{ $lte: [matchDiscount, '$discountRanges.min'] }, { $gte: ['$discount', '$discountRanges.min'] }] }
            : { $gte: ['$discount', '$discountRanges.min'] };

            pipeline = [
                { $match: matchStage },
                { $set: { discountRanges: [
                   { range: '70% And Above', min: 70 },
                   { range: '60% And Above', min: 60},
                   { range: '50% And Above', min: 50},
                   { range: '40% And Above', min: 40},
                   { range: '30% And Above', min: 30},
                   { range: '20% And Above', min: 20},
                   { range: '10% And Above', min: 10},
                ] } },
                { $unwind: '$discountRanges' },
                { $match: { $expr: discountValue  } },
                { $group: { _id: '$discountRanges.range', count: { $sum: 1 },  
                    min: { $first: '$discountRanges.min' }} 
                },
                { $sort: { '_id': -1 } },
                { $project: { _id: 0, name: '$_id', count: 1 , min: 1, } },
            ];           
        } else if( fieldName == 'price') {
            delete matchStage?.price;
            pipeline = [
                { $match: matchStage },
                { $group: {  _id: null, minPrice: { $min: '$price'}, maxPrice: { $max: '$price' }}},
                { $project: {  _id: 0,  minPrice: 1, maxPrice: 1} },
            ] 
        } else {
            pipeline = [
              { $match: matchStage },
              { $unwind: `$moreProductInfo.${fieldName}`},
              { $group: { _id: `$moreProductInfo.${fieldName}`, count: { $sum: 1 },},},
              { $project: { _id: 0, name: "$_id",count: 1,},},
            ];
        }
        return await Product.aggregate(pipeline);
    } catch (error) {
        console.log(error);
    }    
}


module.exports = { createUniqueSlug, otpEmailSend,
       generateOrderId, findCart, cartQty, filterFunction,
       selectCartItem, genderBrandFilter }