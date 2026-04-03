import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../store/slices/authSlice';
import { showAlert } from '../store/slices/uiSlice';

const Login = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { loading } = useSelector((state) => state.auth);
    
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.email || !formData.password) {
            dispatch(showAlert({ type: 'error', message: 'Please fill all fields' }));
            return;
        }
        
        try {
            const result = await dispatch(login(formData)).unwrap();
            dispatch(showAlert({ type: 'success', message: `Welcome back, ${result.user.name}!` }));
            
            // Redirect based on role
            if (result.user.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }
        } catch (error) {
            dispatch(showAlert({ type: 'error', message: error.message || 'Login failed' }));
        }
    };
    
    return (
        <div className="container">
            <div className="card" style={{ maxWidth: '500px', margin: '60px auto' }}>
                <h2 className="card-title" style={{ textAlign: 'center' }}>🔐 Login</h2>
                <p className="card-subtitle" style={{ textAlign: 'center' }}>
                    Access your recruitment dashboard
                </p>
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="admin@example.com or recruiter@example.com"
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    
                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
                
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <p>
                        Don't have an account? <Link to="/register">Register here</Link>
                    </p>
                    <p style={{ fontSize: '12px', color: '#718096', marginTop: '16px' }}>
                        Demo Accounts:<br/>
                        Admin: admin@example.com / admin123<br/>
                        Recruiter: recruiter@example.com / recruiter123
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;