import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createJob } from '../store/slices/jobSlice';
import { showAlert } from '../store/slices/uiSlice';

const Admin = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { loading } = useSelector((state) => state.jobs);
    
    const [jobData, setJobData] = useState({
        title: '',
        jd_text: '',
        weights: {}
    });
    const [weightInputs, setWeightInputs] = useState([{ skill: '', weight: '' }]);
    const [biasWarning, setBiasWarning] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const handleJDChange = (e) => {
        const text = e.target.value;
        setJobData({ ...jobData, jd_text: text });
        
        // Simple bias detection
        const genderedWords = ['rockstar', 'ninja', 'guru', 'dominate', 'competitive', 'aggressive', 'manpower'];
        const foundBiases = genderedWords.filter(word => text.toLowerCase().includes(word));
        
        if (foundBiases.length > 0) {
            setBiasWarning(`Potentially biased language detected: ${foundBiases.join(', ')}`);
        } else {
            setBiasWarning(null);
        }
    };
    
    const handleWeightChange = (index, field, value) => {
        const newInputs = [...weightInputs];
        newInputs[index][field] = value;
        setWeightInputs(newInputs);
        
        // Update weights object
        const weights = {};
        newInputs.forEach(input => {
            if (input.skill && input.weight) {
                weights[input.skill] = parseFloat(input.weight);
            }
        });
        setJobData({ ...jobData, weights });
    };
    
    const addWeightField = () => {
        setWeightInputs([...weightInputs, { skill: '', weight: '' }]);
    };
    
    const removeWeightField = (index) => {
        const newInputs = weightInputs.filter((_, i) => i !== index);
        setWeightInputs(newInputs);
        
        // Update weights object
        const weights = {};
        newInputs.forEach(input => {
            if (input.skill && input.weight) {
                weights[input.skill] = parseFloat(input.weight);
            }
        });
        setJobData({ ...jobData, weights });
    };
    
    const resetForm = () => {
        setJobData({
            title: '',
            jd_text: '',
            weights: {}
        });
        setWeightInputs([{ skill: '', weight: '' }]);
        setBiasWarning(null);
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!jobData.title || !jobData.jd_text) {
            dispatch(showAlert({ type: 'error', message: 'Please fill all required fields' }));
            return;
        }
        
        if (Object.keys(jobData.weights).length === 0) {
            dispatch(showAlert({ type: 'warning', message: 'Please add at least one skill weight' }));
            return;
        }
        
        setIsSubmitting(true);
        
        try {
            const result = await dispatch(createJob(jobData)).unwrap();
            
            // Show success message
            dispatch(showAlert({ type: 'success', message: `✅ Job "${result.title}" created successfully!` }));
            
            // Show bias warning if exists
            if (biasWarning) {
                setTimeout(() => {
                    dispatch(showAlert({ type: 'warning', message: biasWarning }));
                }, 1000);
            }
            
            // Reset form
            resetForm();
            
            // Navigate to upload page after 1.5 seconds
            setTimeout(() => {
                navigate('/upload');
            }, 1500);
            
        } catch (error) {
            dispatch(showAlert({ type: 'error', message: error.message || 'Failed to create job' }));
        } finally {
            setIsSubmitting(false);
        }
    };
    
    return (
        <div className="container">
            <div className="card">
                <h2 className="card-title">📋 Create New Job Posting</h2>
                <p className="card-subtitle">Set up job description and skill weights for AI screening</p>
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Job Title *</label>
                        <input
                            type="text"
                            value={jobData.title}
                            onChange={(e) => setJobData({ ...jobData, title: e.target.value })}
                            placeholder="e.g., Senior Full Stack Developer"
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Job Description *</label>
                        <textarea
                            rows="8"
                            value={jobData.jd_text}
                            onChange={handleJDChange}
                            placeholder="Paste job description here..."
                            required
                        />
                        {biasWarning && (
                            <div className="alert alert-warning" style={{ marginTop: '12px' }}>
                                ⚠️ {biasWarning}
                            </div>
                        )}
                    </div>
                    
                    <div className="form-group">
                        <label>Skill Weights (0-1 scale)</label>
                        <p style={{ fontSize: '14px', color: '#718096', marginBottom: '12px' }}>
                            Define skills and their importance. Higher weight = more important.
                        </p>
                        {weightInputs.map((input, index) => (
                            <div key={index} className="weight-row">
                                <input
                                    type="text"
                                    placeholder="Skill (e.g., Python)"
                                    value={input.skill}
                                    onChange={(e) => handleWeightChange(index, 'skill', e.target.value)}
                                />
                                <input
                                    type="number"
                                    placeholder="Weight (0-1)"
                                    value={input.weight}
                                    onChange={(e) => handleWeightChange(index, 'weight', e.target.value)}
                                    step="0.1"
                                    min="0"
                                    max="1"
                                />
                                {weightInputs.length > 1 && (
                                    <button type="button" onClick={() => removeWeightField(index)}>
                                        Remove
                                    </button>
                                )}
                            </div>
                        ))}
                        <button type="button" className="btn btn-success" onClick={addWeightField} style={{ marginTop: '12px' }}>
                            + Add Skill
                        </button>
                    </div>
                    
                    <button type="submit" className="btn btn-primary" disabled={loading || isSubmitting}>
                        {isSubmitting ? 'Creating...' : 'Create Job Posting'}
                    </button>
                </form>
            </div>
            
            <div className="card" style={{ background: '#f7fafc' }}>
                <h3 style={{ marginBottom: '16px' }}>💡 Pro Tip</h3>
                <p style={{ color: '#718096', lineHeight: '1.6' }}>
                    The EU AI Act requires transparency in automated decision-making. 
                    Our tool ensures bias-free screening by redacting personal information 
                    before AI analysis and requiring human oversight for all final decisions.
                </p>
            </div>
        </div>
    );
};

export default Admin;