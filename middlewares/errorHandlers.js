

//not Found
const notFound = (req, res, next) =>{
   const error = new Error(`Not Found : ${req.originalUrl}`);
   res.status(404).render('404Page', {errorPage:true});
   
}

// Error Handler
const internalError = (err, req, res, next) => {
  console.log(err);
  res.status(500).render('500Page', { errorPage: true });
};

module.exports = { notFound, internalError}