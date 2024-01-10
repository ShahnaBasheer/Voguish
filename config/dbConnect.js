const mongoose = require('mongoose');

const dbConnect = async () => {
    if (!process.env.MONGODB_URL) {
        console.error("MONGODB_URL is not defined in the environment variables.");
        return;
    }

    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("Database connected successfully!");
    } catch (error) {
        console.error("Database Error", error);
        throw error;
    }
};


module.exports = dbConnect;