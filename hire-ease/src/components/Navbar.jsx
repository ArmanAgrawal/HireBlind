import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { showAlert } from '../store/slices/uiSlice';

const Navbar = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { isAuthenticated, user } = useSelector((state) => state.auth);
    const { currentJob } = useSelector((state) => state.jobs);
    
    const handleLogout = async () => {
        await dispatch(logout());
        dispatch(showAlert({ type: 'success', message: 'Logged out successfully' }));
        navigate('/');
    };
    
    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="logo">
                    🤖 BiasFree AI
                </Link>
                <div className="nav-links">
                    <Link to="/">Home</Link>
                    
                    {isAuthenticated ? (
                        <>
                            {user?.role === 'admin' && (
                                <Link to="/admin">Admin Setup</Link>
                            )}
                            <Link to="/upload">Upload</Link>
                            <Link to="/dashboard">Dashboard</Link>
                            <div className="user-menu">
                                <span className="user-badge">
                                    👤 {user?.name} ({user?.role})
                                </span>
                                <button onClick={handleLogout} className="logout-btn">
                                    Logout
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <Link to="/login">Login</Link>
                            <Link to="/register">Register</Link>
                        </>
                    )}
                    
                    {currentJob && (
                        <span className="job-badge">
                            Active: {currentJob.title}
                        </span>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;