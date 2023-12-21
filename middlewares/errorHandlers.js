//not Found

const notFound = (req, res, next) =>{
   const error = new Error(`Not Found : ${req.originalUrl}`);
   res.status(404).render('404Page', {errorPage:true});
   
}

// Error Handler

const errorHandler = (err, req, res, next) =>{
  const statuscode = res.statusCode == 200 ? 500 : res.statusCode; //500 Internal Server Error
  res.status(statuscode).render('500Page', {errorPage: true});
  /*res.json({
      message : err?.message,
      stack : err?.stack,
  });*/
}

module.exports = { notFound, errorHandler }