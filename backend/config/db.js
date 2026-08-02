const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DATABASE_URL);
        console.log('MongoDB Connected Successfully');
    } catch (error) {
        console.error('Database connection failed:', error.message);
        process.exit(1); // Stop the server if the database fails
    }
};

module.exports = connectDB;