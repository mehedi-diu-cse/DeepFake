import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import Layout from './components/Layout';
import './styles/global.css';

const App = () => {
    const [status, setStatus] = useState('Checking API...');

    useEffect(() => {
        // Test connection to our backend
        fetch(`${import.meta.env.VITE_API_URL}/health`)
            .then(res => res.json())
            .then(data => setStatus(data.message))
            .catch(err => setStatus('Backend disconnected.'));
    }, []);

    return (
        <Layout>
            <h1>Welcome to the Frontend</h1>
            <p>Backend Status: <strong>{status}</strong></p>
        </Layout>
    );
};

// Mount the app
const root = createRoot(document.getElementById('root'));
root.render(<App />);