const moment = require('moment');

const removeGMT = function(dateString) {
    const formattedDate = moment(dateString).format('DD/MM/YYYY hh:mm A');
    return formattedDate;
};

const momentsAgo = function(dateString) {
    const formattedDate = moment(dateString).fromNow();
    return formattedDate;
};

const reviewFormat = function(dateString) {
    const formattedDate = moment(dateString).format('DD MMMM YYYY');
    return formattedDate;
};

const isEqualTo = function(value, targetValue) { return value === targetValue };
const roleEquals = function (role) { return role === 'admin' }; 
const inc = function(value) { return parseInt(value) + 1 };

const loop = function(n, block){
    let accum = '';
    for (let i = 0; i < n; ++i) {
      accum += block.fn(i + 1); ;
    }
    return accum;
};

const calculateTotal = function(sizes) {
    let total = 0;
    for(let key of sizes) { total += key.stock }
    return total;
  };

const uniqueColors = function(sizes){
    let colors = new Set();
    for(let key in sizes) { 
        Array.from(sizes[key]).forEach((item)=>{
           colors.add(item.color);
        });
    }
    return Array.from(colors);
}

const calculate =  function (operation, num1, num2) {
    switch (operation) {
        case 'add':
            return num1 + num2;
        case 'subtract':
            return  num1 - num2;
        case 'multiply':
            return  num1 * num2;
        case 'divide':
            return  num1 / num2;
        default:
            throw new Error('Invalid operation');
    }
};

const compareIds = function(id1, id2, options) {
    if (id1.toString() === id2.toString()) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
};


const isLessThan = function(a, b) {
    return a <= b;
};


const getProperty = function(obj, key) {
    return obj[key];
  };

const contains = function(array, target){
    if( new Set(array).has(target)){ return true; }
    return false;
} 

// Assuming you have a Handlebars helper setup
const isInArray = function(element, ...arrayElements) {
    return arrayElements.includes(element);
};


module.exports = { 
    removeGMT , 
    isEqualTo, 
    roleEquals, 
    inc, 
    loop, 
    calculateTotal,
    uniqueColors,
    calculate,
    compareIds,
    isLessThan,
    reviewFormat,
    momentsAgo,
    getProperty,
    contains,
    isInArray
} ;