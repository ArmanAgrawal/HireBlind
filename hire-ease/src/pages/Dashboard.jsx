import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCandidates } from '../store/slices/candidateSlice';
import { fetchJobs, setCurrentJob } from '../store/slices/jobSlice';
import { showAlert } from '../store/slices/uiSlice';
import CandidateModal from '../components/CandidateModal';

const Dashboard = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { currentJob, jobs = [], loading: jobsLoading } = useSelector((state) => state.jobs || { jobs: [] });
    const { list = [], loading: candidatesLoading } = useSelector((state) => state.candidates || { list: [] });
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [showJobSelector, setShowJobSelector] = useState(false);
    
    useEffect(() => {
        // Load stored job from localStorage on mount
        const storedJobId = localStorage.getItem('currentJobId');
        const storedJob = localStorage.getItem('currentJob');
        
        if (storedJobId && storedJob) {
            dispatch(setCurrentJob(JSON.parse(storedJob)));
        }
        
        // Fetch all jobs to populate job selector
        dispatch(fetchJobs());
    }, [dispatch]);
    
    useEffect(() => {
        if (currentJob) {
            loadCandidates();
        }
    }, [currentJob]);
    
    const loadCandidates = async () => {
        if (currentJob) {
            setRefreshing(true);
            await dispatch(fetchCandidates(currentJob.id));
            setRefreshing(false);
        }
    };
    
    const handleJobSelect = (job) => {
        dispatch(setCurrentJob(job));
        setShowJobSelector(false);
        dispatch(showAlert({ type: 'success', message: `Switched to job: ${job.title}` }));
    };
    
    const getScoreClass = (score) => {
        if (score === null || score === undefined) return 'badge-warning';
        if (score >= 70) return 'badge-success';
        if (score >= 40) return 'badge-warning';
        return 'badge-danger';
    };
    
    const getScoreText = (score) => {
        if (score === null || score === undefined) return 'Pending';
        return score;
    };
    
    const handleReview = (candidate) => {
        setSelectedCandidate(candidate);
        setModalOpen(true);
    };
    
    const handleModalClose = () => {
        setModalOpen(false);
        setSelectedCandidate(null);
        loadCandidates();
    };
    
    // Safely sort candidates - ensure list is an array
    const sortedCandidates = Array.isArray(list) ? [...list].sort((a, b) => {
        const scoreA = a.score || 0;
        const scoreB = b.score || 0;
        return scoreB - scoreA;
    }) : [];
    
    const getTopCandidateId = () => {
        if (sortedCandidates.length > 0 && sortedCandidates[0].score !== null) {
            return sortedCandidates[0].id;
        }
        return null;
    };
    
    const isLoading = jobsLoading || candidatesLoading || refreshing;
    
    if (isLoading) {
        return (
            <div className="container">
                <div className="loading-container">
                    <div className="spinner"></div>
                </div>
            </div>
        );
    }
    
    // Ensure jobs is an array
    const jobsList = Array.isArray(jobs) ? jobs : [];
    
    return (
        <div className="container">
            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                    <h2 className="card-title" style={{ marginBottom: 0 }}>🎯 Blind Candidate Ranking</h2>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button 
                            className="btn btn-secondary" 
                            onClick={() => setShowJobSelector(!showJobSelector)}
                            style={{ padding: '8px 16px' }}
                        >
                            {currentJob ? 'Change Job' : 'Select Job'}
                        </button>
                        <button 
                            className="btn btn-secondary" 
                            onClick={loadCandidates}
                            disabled={refreshing || !currentJob}
                            style={{ padding: '8px 16px' }}
                        >
                            {refreshing ? '⟳ Refreshing...' : '⟳ Refresh'}
                        </button>
                    </div>
                </div>
                
                {showJobSelector && jobsList.length > 0 && (
                    <div className="alert alert-info" style={{ marginBottom: '20px' }}>
                        <strong>Select a job to view candidates:</strong>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '12px', flexWrap: 'wrap' }}>
                            {jobsList.map(job => (
                                <button
                                    key={job.id}
                                    className="btn btn-secondary"
                                    onClick={() => handleJobSelect(job)}
                                    style={{ padding: '8px 16px' }}
                                >
                                    {job.title}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                
                {currentJob && (
                    <p className="card-subtitle">
                        Current Job: <strong>{currentJob.title}</strong> | Candidates are ranked by AI score (PII removed)
                    </p>
                )}
                
                {!currentJob && (
                    <div className="alert alert-warning">
                        ⚠️ No job selected. Please create a job or select one from above.
                        <button 
                            className="btn btn-primary" 
                            onClick={() => navigate('/admin')}
                            style={{ marginLeft: '16px', padding: '6px 12px' }}
                        >
                            Create Job
                        </button>
                    </div>
                )}
                
                {!currentJob ? null : sortedCandidates.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
                        <h3>No Candidates Yet</h3>
                        <p style={{ color: '#718096', marginTop: '8px' }}>
                            Upload resumes to see AI-scored candidates here
                        </p>
                        <button 
                            className="btn btn-primary" 
                            onClick={() => navigate('/upload')}
                            style={{ marginTop: '20px' }}
                        >
                            Upload Resumes
                        </button>
                    </div>
                ) : (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Rank</th>
                                    <th>Candidate ID</th>
                                    <th>Score</th>
                                    <th>Confidence</th>
                                    <th>Reasoning</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedCandidates.map((candidate, index) => (
                                    <tr key={candidate.id}>
                                        <td>
                                            <strong>#{index + 1}</strong>
                                            {index === 0 && candidate.score !== null && (
                                                <span style={{ marginLeft: '8px' }}>🏆</span>
                                            )}
                                        </td>
                                        <td>Candidate_{index + 1}</td>
                                        <td>
                                            <span className={`badge ${getScoreClass(candidate.score)}`}>
                                                {getScoreText(candidate.score)}
                                            </span>
                                        </td>
                                        <td>
                                            {candidate.confidence ? `${(candidate.confidence * 100).toFixed(0)}%` : 'N/A'}
                                        </td>
                                        <td>
                                            {candidate.reasoning && Array.isArray(candidate.reasoning) && candidate.reasoning.length > 0 ? (
                                                <div className="tooltip">
                                                    <span className="tooltip-icon">🔍 View</span>
                                                    <div className="tooltip-text">
                                                        {candidate.reasoning.map((r, i) => (
                                                            <div key={i}>• {r}</div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : (
                                                <span style={{ color: '#718096' }}>Processing...</span>
                                            )}
                                        </td>
                                        <td>
                                            <button
                                                className="btn btn-primary"
                                                onClick={() => handleReview(candidate)}
                                                style={{ padding: '6px 12px', fontSize: '14px' }}
                                            >
                                                Review
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            
            {modalOpen && selectedCandidate && (
                <CandidateModal
                    candidate={selectedCandidate}
                    onClose={handleModalClose}
                    isTopCandidate={getTopCandidateId() === selectedCandidate.id}
                    jobId={currentJob?.id}
                />
            )}
        </div>
    );
};

export default Dashboard;