require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const connectDB = require('./config/db');
const apiRoutes = require('./routes/apiRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// ফ্রন্টএন্ড থেকে সার্ভার লাইভ কি না তা চেক করার রুট
app.get('/', (req, res) => {
    res.json({ message: "Backend is running flawlessly!" });
});

const PORT = process.env.PORT || 5000;
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ছবি চেকের রুট (apiRoutes-এর উপরে রাখা হলো যাতে কোনো কনফ্লিক্ট না হয়)
app.post('/api/check-image', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "দয়া করে একটি ছবি আপলোড করুন!" });
        }

        const imageBase64 = req.file.buffer.toString("base64");
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
        
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
        // ফিক্স: গুগল এআই-এর আসল এরর মেসেজটি সরাসরি ফ্রন্টএন্ডে (ওয়েবসাইটে) পাঠানো হচ্ছে
        res.status(500).json({ 
            success: false, 
            message: `Google AI Error: ${error.message || 'Unknown Error'}` 
        });
    }
});

app.use('/api', apiRoutes);

app.listen(PORT, () => {
    console.log(`Server running in high-performance mode on port ${PORT}`);
});