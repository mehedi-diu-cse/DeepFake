import React from 'react';

const Layout = ({ children }) => {
    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
            <header>
                <h2>My High-Performance App</h2>
            </header>
            <main style={{ marginTop: '40px' }}>
                {children}
            </main>
        </div>
    );
};

export default Layout;