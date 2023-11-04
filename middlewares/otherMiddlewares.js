
// Middleware to remove empty string values from req.body
const removeEmptyStrings = (req, res, next) => {
  Object.keys(req.body).forEach(key => {
      if (req.body[key] === "") {
          delete req.body[key];
      }
  });
  next(); 
};

module.exports = { removeEmptyStrings }