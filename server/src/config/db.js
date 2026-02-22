const mongoose = require("mongoose");

const connectDB = async() => {
    try {
        
        await mongoose.connect(process.env.MONGO_URI, {serverSelectionTimeoutMS: 5000});
        console.log("DB Connected Successfully!");
        
        
    } catch (err) {
        console.log("DB Error: ", err.message);
        process.exit(1);
    }
}

module.exports = connectDB