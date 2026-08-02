import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import Layout from './components/Layout';
import './styles/global.css';

const App = () => {
    const [status, setStatus] = useState('Checking API...');
    const [file, setFile] = useState(null);
    const [result, setResult] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Test connection to our backend
        fetch(`${import.meta.env.VITE_API_URL}/health`)
            .then(res => res.json())
            .then(data => setStatus(data.message))
            .catch(err => setStatus('Backend disconnected.'));
    }, []);

    const handleUpload = async () => {
        if (!file) {
            alert("দয়া করে আগে একটি ছবি সিলেক্ট করুন!");
            return;
        }
        setLoading(true);
        setResult("এআই ছবি চেক করছে, কয়েক সেকেন্ড অপেক্ষা করুন...");
        
        const formData = new FormData();
        formData.append("image", file);

        try {
            // নিচে আপনার লাইভ ব্যাকএন্ডের লিংক দিতে হবে (লোকালে টেস্ট করলে localhost ঠিক আছে)
            const response = await fetch("https://deepfake-lumd.onrender.com/api/check-image", {
                method: "POST",
                body: formData,
            });
            const data = await response.json();
            
            if (data.success) {
                setResult(data.explanation);
            } else {
                setResult("সমস্যা হয়েছে: " + data.message);
            }
        } catch (error) {
            setResult("সার্ভারের সাথে কানেক্ট করা যাচ্ছে না!");
            console.error(error);
        }
        setLoading(false);
    };

    return (
        <Layout>
            <h1>Welcome to the Frontend</h1>
            <p>Backend Status: <strong>{status}</strong></p>

            <div style={{ textAlign: "center", margin: "20px", padding: "20px", border: "1px solid gray", borderRadius: "10px" }}>
                <h2>DeepFake Image Checker</h2>
                <input type="file" onChange={(e) => setFile(e.target.files[0])} style={{ marginBottom: "10px" }} />
                <br />
                <button onClick={handleUpload} disabled={loading} style={{ padding: "10px 20px", cursor: "pointer", background: "#007BFF", color: "white", border: "none", borderRadius: "5px" }}>
                    {loading ? "Checking..." : "Check Real or Fake"}
                </button>
                <div style={{ marginTop: "20px", whiteSpace: "pre-wrap", textAlign: "left", padding: "10px", background: "#f8f9fa" }}>
                    <strong>Result:</strong> <br/> {result}
                </div>
            </div>
        </Layout>
    );
};

// Mount the app
const root = createRoot(document.getElementById('root'));
root.render(<App />);