const User = require('../models/User');

// Example endpoint logic for registering a user
exports.registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        // In a real app, hash the password here using bcrypt!
        const newUser = await User.create({ username, email, password });
        
        res.status(201).json({ success: true, data: newUser });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};