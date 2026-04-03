import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { candidatesAPI } from '../store/api';
import { fetchCandidates } from '../store/slices/candidateSlice';
import { fetchJobs, setCurrentJob } from '../store/slices/jobSlice';
import { showAlert } from '../store/slices/uiSlice';

const Upload = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { currentJob, jobs = [], loading: jobsLoading } = useSelector((state) => state.jobs || { jobs: [] });
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [showJobSelector, setShowJobSelector] = useState(false);
    
    // Load stored job and all jobs on mount
    useEffect(() => {
        const storedJobId = localStorage.getItem('currentJobId');
        const storedJob = localStorage.getItem('currentJob');
        
        if (storedJobId && storedJob) {
            dispatch(setCurrentJob(JSON.parse(storedJob)));
        }
        
        // Fetch all jobs from backend
        dispatch(fetchJobs());
    }, [dispatch]);
    
    const handleJobSelect = (job) => {
        dispatch(setCurrentJob(job));
        setShowJobSelector(false);
        dispatch(showAlert({ type: 'success', message: `Selected job: ${job.title}` }));
    };
    
    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    }, []);
    
    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        
        const droppedFiles = Array.from(e.dataTransfer.files);
        const pdfFiles = droppedFiles.filter(file => file.type === 'application/pdf');
        
        if (pdfFiles.length === 0) {
            dispatch(showAlert({ type: 'error', message: 'Please upload PDF files only' }));
            return;
        }
        
        setFiles(prev => [...prev, ...pdfFiles]);
    }, [dispatch]);
    
    const handleFileSelect = (e) => {
        const selectedFiles = Array.from(e.target.files);
        const pdfFiles = selectedFiles.filter(file => file.type === 'application/pdf');
        
        if (pdfFiles.length === 0) {
            dispatch(showAlert({ type: 'error', message: 'Please upload PDF files only' }));
            return;
        }
        
        setFiles(prev => [...prev, ...pdfFiles]);
    };
    
    const removeFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };
    
    const handleUpload = async () => {
        if (files.length === 0) {
            dispatch(showAlert({ type: 'error', message: 'Please select files to upload' }));
            return;
        }
        
        if (!currentJob) {
            dispatch(showAlert({ type: 'error', message: 'No job selected. Please select or create a job first.' }));
            return;
        }
        
        setUploading(true);
        
        try {
            const result = await candidatesAPI.upload(currentJob.id, files);
            dispatch(showAlert({ 
                type: 'success', 
                message: `✅ ${result.candidate_count || files.length} resume(s) uploaded successfully! AI scoring started in background.` 
            }));
            
            // Clear files after successful upload
            setFiles([]);
            
            // Fetch candidates for dashboard
            await dispatch(fetchCandidates(currentJob.id));
            
            // Ask user if they want to go to dashboard
            setTimeout(() => {
                const goToDashboard = window.confirm('Upload complete! Would you like to view the dashboard now?');
                if (goToDashboard) {
                    navigate('/dashboard');
                }
            }, 500);
            
        } catch (error) {
            dispatch(showAlert({ type: 'error', message: error.message || 'Upload failed' }));
        } finally {
            setUploading(false);
        }
    };
    
    // Safely check jobs length
    const jobsList = jobs || [];
    
    return (
        <div className="container">
            <div className="card">
                <h2 className="card-title">📄 Upload Resumes</h2>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <p className="card-subtitle" style={{ marginBottom: 0 }}>
                        {currentJob ? (
                            <>Uploading for: <strong>{currentJob.title}</strong></>
                        ) : (
                            <>No job selected</>
                        )}
                    </p>
                    <button 
                        className="btn btn-secondary" 
                        onClick={() => setShowJobSelector(!showJobSelector)}
                        style={{ padding: '6px 12px', fontSize: '14px' }}
                    >
                        {currentJob ? 'Change Job' : 'Select Job'}
                    </button>
                </div>
                
                {showJobSelector && jobsList.length > 0 && (
                    <div className="alert alert-info" style={{ marginBottom: '20px' }}>
                        <strong>Select a job to upload resumes for:</strong>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '12px', flexWrap: 'wrap' }}>
                            {jobsList.map(job => (
                                <button
                                    key={job.id}
                                    className="btn btn-secondary"
                                    onClick={() => handleJobSelect(job)}
                                    style={{ padding: '6px 12px', fontSize: '14px' }}
                                >
                                    {job.title}
                                </button>
                            ))}
                        </div>
                        <button 
                            className="btn btn-primary" 
                            onClick={() => navigate('/admin')}
                            style={{ marginTop: '12px', padding: '6px 12px', fontSize: '14px' }}
                        >
                            + Create New Job
                        </button>
                    </div>
                )}
                
                {showJobSelector && jobsList.length === 0 && !jobsLoading && (
                    <div className="alert alert-warning" style={{ marginBottom: '20px' }}>
                        No jobs found. Please create a job first.
                        <button 
                            className="btn btn-primary" 
                            onClick={() => navigate('/admin')}
                            style={{ marginLeft: '16px', padding: '6px 12px' }}
                        >
                            Create Job
                        </button>
                    </div>
                )}
                
                {!currentJob && !showJobSelector && (
                    <div className="alert alert-warning">
                        ⚠️ Please select a job or create a new one to upload resumes.
                        <button 
                            className="btn btn-primary" 
                            onClick={() => navigate('/admin')}
                            style={{ marginLeft: '16px', padding: '6px 12px' }}
                        >
                            Create Job
                        </button>
                    </div>
                )}
                
                {currentJob && (
                    <>
                        {/* Drag & Drop Zone */}
                        <div
                            className={`dropzone ${dragActive ? 'active' : ''}`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                        >
                            <input
                                type="file"
                                id="file-upload"
                                multiple
                                accept=".pdf"
                                onChange={handleFileSelect}
                                style={{ display: 'none' }}
                            />
                            <label htmlFor="file-upload" style={{ cursor: 'pointer' }}>
                                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📁</div>
                                <p>Drag & drop PDF resumes here, or click to select</p>
                                <small style={{ color: '#718096' }}>Supports batch upload (50+ files)</small>
                            </label>
                        </div>
                        
                        {/* File List */}
                        {files.length > 0 && (
                            <div style={{ marginTop: '24px' }}>
                                <h3 style={{ marginBottom: '16px' }}>Selected Files ({files.length})</h3>
                                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                    {files.map((file, index) => (
                                        <div key={index} style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '12px',
                                            background: '#f7fafc',
                                            marginBottom: '8px',
                                            borderRadius: '8px'
                                        }}>
                                            <span>📄 {file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
                                            <button
                                                onClick={() => removeFile(index)}
                                                style={{
                                                    background: '#e53e3e',
                                                    color: 'white',
                                                    border: 'none',
                                                    padding: '4px 12px',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {/* Upload Button */}
                        <button
                            className="btn btn-primary"
                            onClick={handleUpload}
                            disabled={uploading || files.length === 0}
                            style={{ marginTop: '24px', width: '100%' }}
                        >
                            {uploading ? (
                                <>
                                    <div className="spinner" style={{ width: '20px', height: '20px', margin: '0' }}></div>
                                    Uploading & Processing...
                                </>
                            ) : (
                                `Upload ${files.length} Resume(s)`
                            )}
                        </button>
                    </>
                )}
            </div>
            
            <div className="card" style={{ background: '#f7fafc' }}>
                <h3 style={{ marginBottom: '16px' }}>🔒 Privacy Guarantee</h3>
                <p style={{ color: '#718096', lineHeight: '1.6' }}>
                    All resumes are automatically redacted to remove personal information 
                    (names, emails, phone numbers, addresses) before AI analysis. 
                    Your data is never shared and audit logs are maintained for compliance.
                </p>
            </div>
        </div>
    );
};

export default Upload;