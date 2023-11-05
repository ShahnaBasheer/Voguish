
const rateLimit = require('express-rate-limit');

// Middleware to remove empty string values from req.body
const removeEmptyStrings = (req, res, next) => {
  Object.keys(req.body).forEach(key => {
      if (req.body[key] === "") {
          delete req.body[key];
      }
  });
  next(); 
};

// Apply rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 3, // Limit each IP to 3 requests per windowMs
  //message: 'Too many OTP requests. Try again later.',
});



module.exports = { removeEmptyStrings, limiter }