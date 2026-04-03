import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Home from './pages/Home';
import Admin from './pages/Admin';
import Upload from './pages/Upload';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Unauthorized from './pages/Unauthorized';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import { hideAlert } from './store/slices/uiSlice';
import { getCurrentUser } from './store/slices/authSlice';
import './App.css';

function App() {
    const { alert } = useSelector((state) => state.ui);
    const { isAuthenticated, token } = useSelector((state) => state.auth);
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
    
    // Validate token on app load
    useEffect(() => {
        if (token && !isAuthenticated) {
            dispatch(getCurrentUser());
        }
    }, [token, isAuthenticated, dispatch]);
    
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
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/unauthorized" element={<Unauthorized />} />
                    
                    {/* Admin only routes */}
                    <Route path="/admin" element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <Admin />
                        </ProtectedRoute>
                    } />
                    
                    {/* Recruiter + Admin routes */}
                    <Route path="/upload" element={
                        <ProtectedRoute allowedRoles={['admin', 'recruiter']}>
                            <Upload />
                        </ProtectedRoute>
                    } />
                    
                    <Route path="/dashboard" element={
                        <ProtectedRoute allowedRoles={['admin', 'recruiter']}>
                            <Dashboard />
                        </ProtectedRoute>
                    } />
                </Routes>
            </main>
            <Footer />
        </>
    );
}

export default App;