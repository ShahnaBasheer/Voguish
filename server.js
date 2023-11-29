const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const dbConnect = require('./config/dbConnect');
const exphbs = require('express-handlebars');
const logger = require('morgan');
const { notFound, errorHandler } = require('./middlewares/errorHandlers');
const { removeGMT, isEqualTo, roleEquals, calculate,
      inc, loop, calculateTotal, uniqueColors, contains,
      isLessThan, compareIds, momentsAgo, isInArray,
      reviewFormat, getProperty, andFunction } = require('./helpers');
const session = require('express-session');
const flash = require('express-flash');
const cors = require('cors');
const dotenv = require('dotenv').config();
const PORT = process.env.PORT || 4000;
const app = express();
dbConnect();

const adminRouter = require('./routes/adminRouter');
const userRouter = require('./routes/userRouter');

app.set('views',path.join(__dirname,'views'));
app.set('view engine', 'hbs');
app.engine(
  'hbs',exphbs.engine({
    extname: 'hbs',
    defaultLayout: 'layout', 
    layoutsDir: path.join(__dirname, 'views','layouts'),
    partialsDir: path.join(__dirname,'views','partials'),
    helpers: { removeGMT, isEqualTo, inc, roleEquals, loop, contains,
              calculateTotal, uniqueColors, calculate, compareIds,
              isLessThan, momentsAgo, reviewFormat, getProperty,
              isInArray, andFunction }
  }));

  

app.use(session({
  secret: 'mysessionkey', // Change this to a secure random string
  resave: false,
  saveUninitialized: true,
}));
app.use(flash());

app.use(cookieParser());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true}));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

app.use('/',userRouter);
app.use('/admin',adminRouter);

// Custom Handlebars Helper
app.use(notFound);
app.use(errorHandler);



app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}...`);
});