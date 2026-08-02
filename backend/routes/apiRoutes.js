const express = require('express');
const router = express.Router();
const { registerUser } = require('../controllers/authController');

// Define your API routes
router.post('/register', registerUser);

// A simple test route
router.get('/health', (req, res) => {
    res.status(200).json({ message: 'API is running fast and smooth!' });
});

module.exports = router;