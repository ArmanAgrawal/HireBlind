import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Home = () => {
    const navigate = useNavigate();
    const { currentJob } = useSelector((state) => state.jobs);
    
    const features = [
        {
            icon: "🎯",
            title: "Bias-Free Screening",
            desc: "AI evaluates skills only - no names, photos, or demographics"
        },
        {
            icon: "🔒",
            title: "PII Redaction",
            desc: "Automatic removal of personal information before AI analysis"
        },
        {
            icon: "👥",
            title: "Human-in-the-Loop",
            desc: "Final decisions made by humans, not algorithms (EU AI Act)"
        },
        {
            icon: "📊",
            title: "Transparent Scoring",
            desc: "See exactly why each candidate received their score"
        },
        {
            icon: "📝",
            title: "Audit Trail",
            desc: "Complete log of all redactions and decisions"
        },
        {
            icon: "⚡",
            title: "Batch Processing",
            desc: "Upload 50+ resumes at once for rapid screening"
        }
    ];
    
    const stats = [
        { number: "99%", label: "Bias Reduction" },
        { number: "<30s", label: "Processing Time" },
        { number: "100%", label: "Audit Compliance" }
    ];
    
    const handleQuickStart = () => {
        if (currentJob) {
            navigate('/upload');
        } else {
            navigate('/admin');
        }
    };
    
    return (
        <>
            {/* Hero Section */}
            <div className="hero">
                <div className="container">
                    <h1>Bias-Free AI Recruitment</h1>
                    <p>
                        EU AI Act compliant recruitment platform<br/>
                        AI screens, humans decide, bias eliminated
                    </p>
                    <div className="hero-buttons">
                        <button className="btn btn-primary" onClick={handleQuickStart}>
                            {currentJob ? "Upload Resumes →" : "Create Job Posting →"}
                        </button>
                        <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
                            View Dashboard
                        </button>
                    </div>
                    
                    {/* Stats */}
                    <div className="stats">
                        {stats.map((stat, idx) => (
                            <div key={idx}>
                                <div className="stat-number">{stat.number}</div>
                                <div className="stat-label">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            
            {/* Current Job Status */}
            {currentJob && (
                <div className="container">
                    <div className="alert alert-success">
                        ✅ Active Job: <strong>{currentJob.title}</strong> - Ready for resume upload
                    </div>
                </div>
            )}
            
            {/* Features Section */}
            <div className="container">
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <h2 style={{ fontSize: '36px', color: '#1a202c', marginBottom: '16px' }}>
                        How It Works
                    </h2>
                    <p style={{ fontSize: '18px', color: '#718096' }}>
                        Complete bias-free recruitment workflow
                    </p>
                </div>
                
                <div className="grid-3">
                    {features.map((feature, idx) => (
                        <div className="feature-card" key={idx}>
                            <div className="feature-icon">{feature.icon}</div>
                            <h3 className="feature-title">{feature.title}</h3>
                            <p className="feature-desc">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Workflow Section */}
            <div className="container">
                <div className="card" style={{ textAlign: 'center', background: '#f7fafc' }}>
                    <h3 className="card-title">⚡ 3-Step Workflow</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '32px', flexWrap: 'wrap' }}>
                        <div style={{ textAlign: 'center', flex: 1, minWidth: '200px' }}>
                            <div style={{ fontSize: '40px', marginBottom: '12px' }}>1️⃣</div>
                            <h4>Admin Setup</h4>
                            <p style={{ color: '#718096', marginTop: '8px' }}>Upload JD + Set weights</p>
                        </div>
                        <div style={{ textAlign: 'center', flex: 1, minWidth: '200px' }}>
                            <div style={{ fontSize: '40px', marginBottom: '12px' }}>2️⃣</div>
                            <h4>AI Screening</h4>
                            <p style={{ color: '#718096', marginTop: '8px' }}>Blind evaluation by AI</p>
                        </div>
                        <div style={{ textAlign: 'center', flex: 1, minWidth: '200px' }}>
                            <div style={{ fontSize: '40px', marginBottom: '12px' }}>3️⃣</div>
                            <h4>Human Decision</h4>
                            <p style={{ color: '#718096', marginTop: '8px' }}>Review → Decide → Reveal</p>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* CTA Section */}
            <div className="container">
                <div className="card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', textAlign: 'center' }}>
                    <h3 className="card-title" style={{ color: 'white' }}>Ready to eliminate hiring bias?</h3>
                    <p style={{ marginBottom: '24px', opacity: 0.95 }}>
                        Start your first bias-free recruitment campaign today
                    </p>
                    <button className="btn btn-secondary" onClick={handleQuickStart} style={{ background: 'white', color: '#667eea' }}>
                        Get Started Now →
                    </button>
                </div>
            </div>
        </>
    );
};

export default Home;