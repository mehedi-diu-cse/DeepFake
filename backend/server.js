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
        
        // 🚀 ১. অটো-ডিটেক্ট: গুগলের কাছে সরাসরি জানতে চাওয়া হচ্ছে কোন মডেল এভেইলেবল আছে
        const modelsRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const modelsData = await modelsRes.json();
        
        if (!modelsData.models) {
            return res.status(500).json({ success: false, message: "API Key কাজ করছে না অথবা গুগলের সার্ভার ডাউন!" });
        }

        // যে মডেলটি ছবি সাপোর্ট করে সেটি অটোমেটিকভাবে খুঁজে বের করা
        const validModel = modelsData.models.find(m => 
            m.name.includes("gemini") && 
            m.supportedGenerationMethods.includes("generateContent")
        );

        if (!validModel) {
            return res.status(500).json({ success: false, message: "আপনার API Key-তে কোনো জেমিনি মডেলের অ্যাক্সেস নেই!" });
        }

        const modelName = validModel.name; // কোড নিজে থেকেই সঠিক নাম বসিয়ে নেবে
        console.log("Auto-selected model:", modelName);

        // 🚀 ২. সরাসরি API কল (প্যাকেজ বাদে, যাতে কোনো ভার্সন সমস্যা না হয়)
        const imageBase64 = req.file.buffer.toString("base64");
        const prompt = "Analyze this image and tell me if it is a real photograph or AI-generated/Fake. Describe exactly why you think it is fake or real based on details like lighting, artifacts, blurring, or noise.";

        const generateRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/${modelName}:generateContent?key=${apiKey}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: prompt },
                        {
                            inline_data: {
                                mime_type: req.file.mimetype,
                                data: imageBase64
                            }
                        }
                    ]
                }]
            })
        });

        const generateData = await generateRes.json();

        if (generateData.error) {
            return res.status(500).json({ success: false, message: `Google API Error: ${generateData.error.message}` });
        }

        const answer = generateData.candidates[0].content.parts[0].text;
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