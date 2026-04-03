// Base URL for backend API
const API_BASE = 'http://localhost:8000/api';

// Generic fetch wrapper with error handling
const fetchAPI = async (endpoint, options = {}) => {
    const url = `${API_BASE}${endpoint}`;
    
    const response = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });
    
    if (!response.ok) {
        let errorMessage = 'API request failed';
        try {
            const error = await response.json();
            errorMessage = error.detail || error.message || errorMessage;
        } catch (e) {
            errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
    }
    
    if (response.status === 204) {
        return null;
    }
    
    return response.json();
};

// API methods for jobs
export const jobsAPI = {
    create: (data) => fetchAPI('/jobs', { method: 'POST', body: JSON.stringify(data) }),
    getAll: () => fetchAPI('/jobs'),
    getById: (id) => fetchAPI(`/jobs/${id}`),
};

// API methods for candidates
export const candidatesAPI = {
    upload: async (jobId, files) => {
        const formData = new FormData();
        files.forEach(file => formData.append('files', file));
        
        const response = await fetch(`${API_BASE}/jobs/${jobId}/upload`, { 
            method: 'POST', 
            body: formData 
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Upload failed');
        }
        
        return response.json();
    },
    getAll: (jobId) => fetchAPI(`/jobs/${jobId}/candidates`),
    reveal: (candidateId) => fetchAPI(`/candidates/${candidateId}/reveal`, { method: 'POST' }),
};

// API methods for decisions
export const decisionsAPI = {
    create: (data) => fetchAPI('/decisions', { method: 'POST', body: JSON.stringify(data) }),
};

// API methods for audit (optional)
export const auditAPI = {
    getLog: (jobId) => fetchAPI(`/jobs/${jobId}/audit`),
};

export const authAPI = {
    register: (data) => fetchAPI('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    login: (data) => fetchAPI('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    getMe: () => fetchAPI('/auth/me'),
};


// Default export for convenience
const api = {
    post: (endpoint, data) => fetchAPI(endpoint, { method: 'POST', body: JSON.stringify(data) }),
    get: (endpoint) => fetchAPI(endpoint, { method: 'GET' }),
    put: (endpoint, data) => fetchAPI(endpoint, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (endpoint) => fetchAPI(endpoint, { method: 'DELETE' }),
};

export default api;