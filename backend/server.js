require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const apiRoutes = require('./routes/apiRoutes');
const multer = require('multer');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', apiRoutes);

const PORT = process.env.PORT || 5000;

// 🔴 Render-এর জন্য ফিক্স: ফোল্ডারের বদলে মেমোরি স্টোরেজ ব্যবহার
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/api/check-image', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "দয়া করে একটি ছবি আপলোড করুন!" });
        }

        // 🔴 Render-এর জন্য ফিক্স: সরাসরি মেমোরি থেকে বাফার রিড করা
        const imageBase64 = req.file.buffer.toString("base64");

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
        const prompt = "Analyze this image and tell me if it is a real photograph or AI-generated/Fake. Describe exactly why you think it is fake or real based on details like lighting, artifacts, blurring, or noise.";
        
        const imagePart = {
            inlineData: {
                data: imageBase64,
                mimeType: req.file.mimetype
            }
        };

        const result = await model.generateContent([prompt, imagePart]);
        const answer = result.response.text();

        res.json({ success: true, explanation: answer });

    } catch (error) {
        console.error("AI Error:", error);
        res.status(500).json({ success: false, message: "সার্ভারে কোনো সমস্যা হয়েছে বা এআই বুঝতে পারেনি।" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running in high-performance mode on port ${PORT}`);
});