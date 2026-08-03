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

app.post('/api/check-image', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "দয়া করে একটি ছবি আপলোড করুন!" });
        }

        const imageBase64 = req.file.buffer.toString("base64");
        const prompt = "Analyze this image and tell me if it is a real photograph or AI-generated/Fake. Describe exactly why you think it is fake or real based on details like lighting, artifacts, blurring, or noise.";
        
        const imagePart = {
            inlineData: {
                data: imageBase64,
                mimeType: req.file.mimetype
            }
        };

        // 🚀 স্মার্ট ফলব্যাক সিস্টেম: সম্ভাব্য সবগুলো মডেলের লিস্ট
        const possibleModels = [
            "gemini-1.5-flash", 
            "gemini-1.5-pro", 
            "gemini-1.0-pro-vision-latest", 
            "gemini-pro-vision"
        ];
        
        let answer = null;
        let finalError = null;

        // সার্ভার একা একাই সবগুলো মডেল চেক করবে
        for (let modelName of possibleModels) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent([prompt, imagePart]);
                answer = result.response.text();
                console.log(`Successfully generated with model: ${modelName}`);
                break; // কোনো একটি মডেল সফল হলেই লুপ বন্ধ হয়ে যাবে!
            } catch (err) {
                console.error(`Model ${modelName} failed: ${err.message}`);
                finalError = err;
            }
        }

        if (answer) {
            res.json({ success: true, explanation: answer });
        } else {
            // যদি দুর্ভাগ্যবশত কোনো মডেলই কাজ না করে
            res.status(500).json({ 
                success: false, 
                message: `Google AI Error: ${finalError?.message || 'All models failed.'}` 
            });
        }

    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ success: false, message: `Server Error: ${error.message}` });
    }
});

app.use('/api', apiRoutes);

app.listen(PORT, () => {
    console.log(`Server running in high-performance mode on port ${PORT}`);
});