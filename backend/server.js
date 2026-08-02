require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const apiRoutes = require('./routes/apiRoutes');
const multer = require('multer');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');

const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(cors()); // Allows your frontend to talk to your backend
app.use(express.json()); // Parses incoming JSON requests securely

// Mount Routes
app.use('/api', apiRoutes);

// Start Server
const PORT = process.env.PORT || 5000;

// ছবি আপলোডের জন্য ফোল্ডার সেটআপ
const upload = multer({ dest: 'uploads/' });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ছবি চেক করার API
app.post('/api/check-image', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "দয়া করে একটি ছবি আপলোড করুন!" });
        }

        const imagePath = req.file.path;
        const imageData = fs.readFileSync(imagePath);
        const imageBase64 = imageData.toString("base64");

        // এআই মডেল কল করা
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = "Analyze this image and tell me if it is a real photograph or AI-generated/Fake. Describe exactly why you think it is fake or real based on details like lighting, artifacts, blurring, or noise.";
        
        const imagePart = {
            inlineData: {
                data: imageBase64,
                mimeType: req.file.mimetype
            }
        };

        const result = await model.generateContent([prompt, imagePart]);
        const answer = result.response.text();

        // কাজ শেষে সার্ভার থেকে সাময়িক ছবিটি মুছে ফেলা
        fs.unlinkSync(imagePath);

        // রেজাল্ট ফ্রন্টএন্ডে পাঠানো
        res.json({ success: true, explanation: answer });

    } catch (error) {
        console.error("AI Error:", error);
        res.status(500).json({ success: false, message: "সার্ভারে কোনো সমস্যা হয়েছে বা এআই বুঝতে পারেনি।" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running in high-performance mode on port ${PORT}`);
});