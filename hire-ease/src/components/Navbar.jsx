import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Navbar = () => {
    const { currentJob } = useSelector((state) => state.jobs);
    
    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="logo">
                    🤖 BiasFree AI
                </Link>
                <div className="nav-links">
                    <Link to="/">Home</Link>
                    <Link to="/admin">Admin Setup</Link>
                    <Link to="/upload">Upload</Link>
                    <Link to="/dashboard">Dashboard</Link>
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