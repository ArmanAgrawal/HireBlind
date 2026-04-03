import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Home from './pages/Home';
import Admin from './pages/Admin';
import Upload from './pages/Upload';
import Dashboard from './pages/Dashboard';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { hideAlert } from './store/slices/uiSlice';
import './App.css';

function App() {
    const { alert } = useSelector((state) => state.ui);
    const dispatch = useDispatch();
    
    // Auto-hide alert after 5 seconds
    useEffect(() => {
        if (alert) {
            const timer = setTimeout(() => {
                dispatch(hideAlert());
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [alert, dispatch]);
    
    const handleCloseAlert = () => {
        dispatch(hideAlert());
    };
    
    return (
        <>
            <Navbar />
            {alert && (
                <div className="container">
                    <div className={`alert alert-${alert.type}`}>
                        <span className="alert-message">{alert.message}</span>
                        <button 
                            className="alert-close" 
                            onClick={handleCloseAlert}
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}
            <main className="main-content">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/admin" element={<Admin />} />
                    <Route path="/upload" element={<Upload />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                </Routes>
            </main>
            <Footer />
        </>
    );
}

export default App;