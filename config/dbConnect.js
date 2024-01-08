const mongoose = require('mongoose');

const dbConnect = () => {
    try{
        const conn = mongoose.connect(process.env.MONGODB_URL,{ useNewUrlParser: true, useUnifiedTopology: true });//dbname
        console.log("Database connected successfull!");
    } catch(error){
        console.log("Databse Error");
    }
}

module.exports = dbConnect;