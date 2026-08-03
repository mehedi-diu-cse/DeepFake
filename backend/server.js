require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');

const connectDB = require('./config/db');
const apiRoutes = require('./routes/apiRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: "Backend is running flawlessly!" });
});

const PORT = process.env.PORT || 5000;
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post('/api/check-image', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "দয়া করে একটি ছবি আপলোড করুন!" });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ success: false, message: "Render সার্ভারে API Key পাওয়া যাচ্ছে না!" });
        }

        const imageBase64 = req.file.buffer.toString("base64");
        const prompt = "Analyze this image and tell me if it is a real photograph or AI-generated/Fake. Describe exactly why you think it is fake or real based on details like lighting, artifacts, blurring, or noise.";

        // 🚀 সরাসরি Google-এর মেইন API-তে রিকোয়েস্ট (সব প্যাকেজের ঝামেলা মুক্ত)
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: prompt },
                        { inline_data: { mime_type: req.file.mimetype, data: imageBase64 } }
                    ]
                }]
            })
        });

        const data = await response.json();

        // গুগল কোনো এরর দিলে সরাসরি ওয়েবসাইটে দেখাবে
        if (!response.ok) {
            return res.status(500).json({ 
                success: false, 
                message: `Google API Error: ${data.error?.message || 'Unknown Error'}` 
            });
        }

        // সফল হলে রেজাল্ট পাঠানো
        const answer = data.candidates[0].content.parts[0].text;
        res.json({ success: true, explanation: answer });

    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ success: false, message: `Server Error: ${error.message}` });
    }
});

app.use('/api', apiRoutes);

app.listen(PORT, () => {
    console.log(`Server running in high-performance mode on port ${PORT}`);
});