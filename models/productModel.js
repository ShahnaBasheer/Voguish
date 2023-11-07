const mongoose = require('mongoose');

// Declare the Schema of the Product model
const productSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase:true,
    },
    images: {
        type: Object,
        required: true,
    },
    gender: {
        type: String,
        required: true,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,    
    },
    price: {
        type: Number, 
    },
    mrp: {
        type: Number,
        required: true,
    },
    discount: {
        type: Number,
        required: true,
        default: 0,
    },
    sizes: {
        type: Map,
        of: [{
            color: {
                type: String,
                required: true,
            },
            stock: {
                type: Number,
                required: true,
                default: 0,
            }
        }]
    },
    totalStock: {
        type: Number,
        default: 0,
    },
    brand: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Brand',
        required: true,  
    },
    moreProductInfo: {
        material: {type: String},
        type: {type: String},
        occassion: {type: String},
        pattern: {type: String},
        neckline: {type: String},
        sleeve: {type: String},
        fit: {type: String},
        closure: {type: String},
        typeOfWork: {type: String},
        legStyle: {type: String},
        riseStyle: {type: String},
        padding: {type: String},
        coverage: {type: String},
        wiring: {type: String},
        careInstructions: {type: String},
        packContains: {type: String}
    },
    description: {
        type: String,
    },
    rating: {
        type: Number,
    },
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review',
      }
    ],
    isDeletedBy: {//entity was deleted by a category or brand deletion action.
        type: Boolean,
        default: false
    }, 
    isDeleted: {//entity was deleted individually
        type: Boolean,
        default: false
    },
    },
    { timestamps : true } 
  
);

// Pre-save hook to calculate price from mrp and discount before saving the product
productSchema.pre('save', function(next) {
    if (this.isDeleted) {
        return next(new Error('Cannot save deleted document.'));
    }
    this.price = Math.ceil(this.mrp - (this.mrp * (this.discount / 100)));

    if(this.sizes){
        let stock = 0;
        this.sizes.forEach (function(value, key) {
            stock += value.reduce((total, item) => total + item.stock, 0)
        })
        this.totalStock = stock;
    }  
    next();
});

//Export the model
module.exports = mongoose.model('Product', productSchema);

/*
 sizes: [{
        size: {
            type: String,
        },
        stock: {
            type: Number,
            required: true,
            default: 0,
        },
    }],
     sizes: {
        type: Map,
        of: {
          stock: {
            type: Number,
            required: true,
          },
        },
        required: true,
    },
*/ 