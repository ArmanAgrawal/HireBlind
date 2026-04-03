import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { submitDecision, revealIdentity } from '../store/slices/candidateSlice';
import { showAlert } from '../store/slices/uiSlice';

const CandidateModal = ({ candidate, onClose, isTopCandidate, jobId }) => {
    const dispatch = useDispatch();
    const [decisionMade, setDecisionMade] = useState(false);
    const [overrideReason, setOverrideReason] = useState('');
    const [showReasonInput, setShowReasonInput] = useState(false);
    const [revealed, setRevealed] = useState(false);
    const [revealedData, setRevealedData] = useState(null);
    const [loading, setLoading] = useState(false);
    
    const getScoreClass = (score) => {
        if (score >= 70) return 'badge-success';
        if (score >= 40) return 'badge-warning';
        return 'badge-danger';
    };
    
    const handleDecision = async (decision) => {
        if (decision === 'reject' && isTopCandidate && !overrideReason) {
            setShowReasonInput(true);
            return;
        }
        
        setLoading(true);
        try {
            await dispatch(submitDecision({
                candidate_id: candidate.id,
                decision: decision,
                override_reason: overrideReason || null,
                decided_by: 'recruiter@example.com'
            })).unwrap();
            
            dispatch(showAlert({ type: 'success', message: `Candidate ${decision}ed successfully!` }));
            setDecisionMade(true);
            setShowReasonInput(false);
        } catch (error) {
            dispatch(showAlert({ type: 'error', message: error.message || 'Decision failed' }));
        } finally {
            setLoading(false);
        }
    };
    
    const handleReveal = async () => {
        setLoading(true);
        try {
            const result = await dispatch(revealIdentity(candidate.id)).unwrap();
            setRevealedData(result);
            setRevealed(true);
            dispatch(showAlert({ type: 'success', message: 'Identity revealed! You may now contact the candidate.' }));
        } catch (error) {
            dispatch(showAlert({ type: 'error', message: error.message || 'Reveal failed' }));
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>×</button>
                
                <h3>📋 Candidate Review</h3>
                
                <div className="form-group">
                    <label>AI Score:</label>
                    <span className={`badge ${getScoreClass(candidate.score)}`} style={{ fontSize: '18px', padding: '8px 16px' }}>
                        {candidate.score || 'Pending'}
                    </span>
                </div>
                
                <div className="form-group">
                    <label>Confidence Level:</label>
                    <span>{candidate.confidence ? `${(candidate.confidence * 100).toFixed(0)}%` : 'N/A'}</span>
                </div>
                
                <div className="form-group">
                    <label>AI Reasoning:</label>
                    <ul style={{ marginLeft: '20px', marginTop: '8px' }}>
                        {candidate.reasoning?.map((reason, idx) => (
                            <li key={idx} style={{ marginBottom: '8px' }}>{reason}</li>
                        )) || <li>AI scoring in progress...</li>}
                    </ul>
                </div>
                
                {!revealed && !decisionMade && (
                    <div className="alert alert-warning">
                        ⚠️ Identity hidden - Make decision first (EU AI Act compliance)
                    </div>
                )}
                
                {revealed && revealedData && (
                    <div className="alert alert-success">
                        <strong>📄 Original Filename:</strong> {revealedData.filename}<br/>
                        <strong>🔍 PII Items Redacted:</strong> {Object.keys(revealedData.pii_map || {}).length} items<br/>
                        <small>Candidate identity revealed for recruitment contact</small>
                    </div>
                )}
                
                {showReasonInput && (
                    <div className="form-group">
                        <label>Reason for rejecting top candidate (required by EU AI Act):</label>
                        <textarea
                            rows="3"
                            value={overrideReason}
                            onChange={(e) => setOverrideReason(e.target.value)}
                            placeholder="Example: Missing required technical skills, overqualified, cultural fit, etc."
                            required
                        />
                        <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                            <button 
                                className="btn btn-danger" 
                                onClick={() => handleDecision('reject')}
                                disabled={!overrideReason || loading}
                            >
                                Confirm Rejection
                            </button>
                            <button 
                                className="btn btn-secondary" 
                                onClick={() => {
                                    setShowReasonInput(false);
                                    setOverrideReason('');
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
                
                {!decisionMade && !showReasonInput && (
                    <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                        <button 
                            className="btn btn-success" 
                            onClick={() => handleDecision('shortlist')}
                            disabled={loading}
                        >
                            ✅ Shortlist
                        </button>
                        <button 
                            className="btn btn-danger" 
                            onClick={() => handleDecision('reject')}
                            disabled={loading}
                        >
                            ❌ Reject
                        </button>
                    </div>
                )}
                
                {decisionMade && !revealed && (
                    <div style={{ marginTop: '20px' }}>
                        <button 
                            className="btn btn-primary" 
                            onClick={handleReveal}
                            disabled={loading}
                            style={{ width: '100%' }}
                        >
                            🔓 Reveal Identity (Contact Candidate)
                        </button>
                    </div>
                )}
                
                {loading && <div className="spinner"></div>}
                
                <button 
                    className="btn btn-secondary" 
                    onClick={onClose}
                    style={{ marginTop: '16px', width: '100%' }}
                >
                    Close
                </button>
            </div>
        </div>
    );
};

export default CandidateModal;