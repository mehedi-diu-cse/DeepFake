import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import Layout from './components/Layout';
import './styles/global.css';

const App = () => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
        if (selectedFile) {
            setPreview(URL.createObjectURL(selectedFile));
            setResult(null);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            alert("দয়া করে আগে একটি ছবি সিলেক্ট করুন!");
            return;
        }
        setLoading(true);
        setResult(null);
        
        const formData = new FormData();
        formData.append("image", file);

        try {
            const response = await fetch("https://deepfake-lumd.onrender.com/api/check-image", {
                method: "POST",
                body: formData,
            });
            const data = await response.json();
            
            if (data.success) {
                const points = data.explanation
                    .split('.')
                    .filter(point => point.trim().length > 0);
                setResult(points);
            } else {
                setResult(["সমস্যা হয়েছে: " + data.message]);
            }
        } catch (error) {
            setResult(["সার্ভারের সাথে কানেক্ট করা যাচ্ছে না!"]);
            console.error(error);
        }
        setLoading(false);
    };

    return (
        <Layout>
            <div style={{ maxWidth: "700px", margin: "10px auto", fontFamily: "Segoe UI, sans-serif", padding: "20px" }}>
                
                {/* মেইন হেডার */}
                <div style={{ textAlign: "center", marginBottom: "25px" }}>
                    <h1 style={{ color: "#1E293B", fontSize: "2.2rem", margin: "0" }}>🛡️ DeepFake Detection System</h1>
                </div>

                {/* মেইন কার্ড */}
                <div style={{ 
                    background: "#ffffff", 
                    padding: "30px", 
                    borderRadius: "16px", 
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                    border: "1px solid #E2E8F0"
                }}>
                    <h2 style={{ color: "#334155", textAlign: "center", marginBottom: "20px", fontSize: "1.5rem" }}>Upload Image for Analysis</h2>
                    
                    {/* ফাইল আপলোড বক্স */}
                    <div style={{ 
                        border: "2px dashed #CBD5E1", 
                        borderRadius: "12px", 
                        padding: "25px", 
                        textAlign: "center", 
                        background: "#F8FAFC",
                        marginBottom: "20px"
                    }}>
                        <input 
                            type="file" 
                            accept="image/*"
                            onChange={handleFileChange} 
                            style={{ display: "none" }} 
                            id="file-upload"
                        />
                        <label htmlFor="file-upload" style={{ 
                            background: "#3B82F6", 
                            color: "white", 
                            padding: "10px 20px", 
                            borderRadius: "8px", 
                            cursor: "pointer", 
                            fontWeight: "600",
                            display: "inline-block",
                            boxShadow: "0 4px 6px rgba(59, 130, 246,.2)"
                        }}>
                            📁 Browse Image
                        </label>
                        <p style={{ marginTop: "10px", color: "#64748B", fontSize: "0.9rem" }}>
                            {file ? file.name : "কোনো ছবি সিলেক্ট করা হয়নি"}
                        </p>

                        {/* ছবির প্রিভিউ */}
                        {preview && (
                            <div style={{ marginTop: "15px" }}>
                                <img src={preview} alt="Preview" style={{ maxHeight: "150px", borderRadius: "8px", border: "1px solid #CBD5E1" }} />
                            </div>
                        )}
                    </div>

                    {/* সাবমিট বাটন */}
                    <button 
                        onClick={handleUpload} 
                        disabled={loading} 
                        style={{ 
                            width: "100%",
                            padding: "12px 20px", 
                            cursor: loading ? "not-allowed" : "pointer", 
                            background: loading ? "#94A3B8" : "#2563EB", 
                            color: "white", 
                            border: "none", 
                            borderRadius: "8px",
                            fontSize: "1.1rem",
                            fontWeight: "bold",
                            transition: "background 0.3s",
                            boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)"
                        }}>
                        {loading ? "Analyzing Image..." : "🔍 Check Real or Fake"}
                    </button>

                    {/* পয়েন্ট আকারে রেজাল্ট প্রদর্শন */}
                    {result && (
                        <div style={{ 
                            marginTop: "25px", 
                            textAlign: "left", 
                            padding: "20px", 
                            background: "#F1F5F9", 
                            borderRadius: "10px",
                            borderLeft: "5px solid #2563EB"
                        }}>
                            <strong style={{ color: "#1E293B", fontSize: "1.1rem" }}>📋 Analysis Result:</strong> 
                            <ul style={{ marginTop: "10px", paddingLeft: "20px", color: "#334155", lineHeight: "1.7" }}>
                                {result.map((item, index) => (
                                    <li key={index} style={{ marginBottom: "8px" }}>{item.replace(/\*\*/g, '').trim()}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

const root = createRoot(document.getElementById('root'));
root.render(<App />);