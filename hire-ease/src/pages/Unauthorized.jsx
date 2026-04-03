import React from 'react';
import { useNavigate } from 'react-router-dom';

const Unauthorized = () => {
    const navigate = useNavigate();
    
    return (
        <div className="container">
            <div className="card" style={{ textAlign: 'center', marginTop: '60px' }}>
                <div style={{ fontSize: '64px', marginBottom: '20px' }}>🚫</div>
                <h2 className="card-title">Access Denied</h2>
                <p className="card-subtitle">
                    You don't have permission to access this page.
                </p>
                <button className="btn btn-primary" onClick={() => navigate('/')}>
                    Go Back Home
                </button>
            </div>
        </div>
    );
};

export default Unauthorized;