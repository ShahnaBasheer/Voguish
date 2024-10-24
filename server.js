const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const dbConnect = require("./config/dbConnect");
const exphbs = require("express-handlebars");
const logger = require("morgan");
const { notFound, internalError } = require("./middlewares/errorHandlers");
const {
  removeGMT,
  isEqualTo,
  roleEquals,
  calculate,
  inc,
  loop,
  calculateTotal,
  uniqueColors,
  contains,
  isLessThan,
  compareIds,
  momentsAgo,
  isInArray,
  dec,
  reviewFormat,
  getProperty,
  andFunction,
  orFunction,
  ORDdate,
  findIdx,
  isGreaterThan,
} = require("./helpers");
const session = require("express-session");
const flash = require("connect-flash");
const cors = require("cors");
const dotenv = require("dotenv").config();
const PORT = process.env.PORT || 8000;
const app = express();

dbConnect();

const adminRouter = require("./routes/adminRouter");
const userRouter = require("./routes/userRouter");

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");
app.engine(
  "hbs",
  exphbs.engine({
    extname: "hbs",
    defaultLayout: "layout",
    layoutsDir: path.join(__dirname, "views", "layouts"),
    partialsDir: path.join(__dirname, "views", "partials"),
    helpers: {
      removeGMT,
      isEqualTo,
      inc,
      roleEquals,
      loop,
      contains,
      calculateTotal,
      uniqueColors,
      calculate,
      compareIds,
      isLessThan,
      momentsAgo,
      reviewFormat,
      getProperty,
      isInArray,
      andFunction,
      orFunction,
      dec,
      ORDdate,
      findIdx,
      isGreaterThan,
    },
  })
);

app.use(
  session({
    secret: "mysessionkey", // Change this to a secure random string
    resave: false,
    saveUninitialized: true,
  })
);
app.use(flash());

app.use(cookieParser());
app.use(logger("dev"));

app.use(express.json({ limit: '100mb' })); // Increase limit to 100MB
app.use(express.urlencoded({ extended: true, limit: '100mb' }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());



// Make flash messages available to all views
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  next();
});


app.use("/", userRouter);
app.use("/admin", adminRouter);


// Custom Handlebars Helper
app.use(notFound);
app.use(internalError);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}...`);
});

/* mongodb+srv://shahnabasheer:8AvbvoI2Jqdhzh25@cluster1.uwkwusl.mongodb.net/Voguish?retryWrites=true&w=majority */

/*  mongodb://0.0.0.0:27017/Voguish  */
