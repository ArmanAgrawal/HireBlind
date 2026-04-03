import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { register } from '../store/slices/authSlice';
import { showAlert } from '../store/slices/uiSlice';

const Register = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { loading } = useSelector((state) => state.auth);
    
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'recruiter'
    });
    
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.name || !formData.email || !formData.password) {
            dispatch(showAlert({ type: 'error', message: 'Please fill all fields' }));
            return;
        }
        
        if (formData.password !== formData.confirmPassword) {
            dispatch(showAlert({ type: 'error', message: 'Passwords do not match' }));
            return;
        }
        
        if (formData.password.length < 6) {
            dispatch(showAlert({ type: 'error', message: 'Password must be at least 6 characters' }));
            return;
        }
        
        try {
            const result = await dispatch(register({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: formData.role
            })).unwrap();
            
            dispatch(showAlert({ type: 'success', message: `Welcome, ${result.user.name}! Registration successful.` }));
            
            // Redirect based on role
            if (result.user.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }
        } catch (error) {
            dispatch(showAlert({ type: 'error', message: error.message || 'Registration failed' }));
        }
    };
    
    return (
        <div className="container">
            <div className="card" style={{ maxWidth: '500px', margin: '60px auto' }}>
                <h2 className="card-title" style={{ textAlign: 'center' }}>📝 Register</h2>
                <p className="card-subtitle" style={{ textAlign: 'center' }}>
                    Create your account
                </p>
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Full Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="John Doe"
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="you@example.com"
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Role</label>
                        <select name="role" value={formData.role} onChange={handleChange}>
                            <option value="recruiter">Recruiter</option>
                            <option value="admin">Admin</option>
                        </select>
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
                    
                    <div className="form-group">
                        <label>Confirm Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    
                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
                        {loading ? 'Registering...' : 'Register'}
                    </button>
                </form>
                
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <p>
                        Already have an account? <Link to="/login">Login here</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;