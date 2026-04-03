import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api';

// Async thunk for creating a job
export const createJob = createAsyncThunk(
    'jobs/create',
    async (jobData, { rejectWithValue }) => {
        try {
            const response = await api.post('/jobs', jobData);
            console.log('Create job response:', response);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data?.detail || error.message);
        }
    }
);

// Async thunk for fetching all jobs
export const fetchJobs = createAsyncThunk(
    'jobs/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/jobs');
            console.log('Fetch jobs response:', response);
            // Ensure we return an array
            return Array.isArray(response) ? response : [];
        } catch (error) {
            console.error('Fetch jobs error:', error);
            return rejectWithValue(error.response?.data?.detail || error.message);
        }
    }
);

// Async thunk for fetching single job
export const fetchJobById = createAsyncThunk(
    'jobs/fetchById',
    async (jobId, { rejectWithValue }) => {
        try {
            const response = await api.get(`/jobs/${jobId}`);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data?.detail || error.message);
        }
    }
);

const jobSlice = createSlice({
    name: 'jobs',
    initialState: {
        currentJob: null,
        jobs: [],
        loading: false,
        error: null
    },
    reducers: {
        setCurrentJob: (state, action) => {
            state.currentJob = action.payload;
            if (action.payload) {
                localStorage.setItem('currentJobId', action.payload.id);
                localStorage.setItem('currentJob', JSON.stringify(action.payload));
            } else {
                localStorage.removeItem('currentJobId');
                localStorage.removeItem('currentJob');
            }
        },
        clearError: (state) => {
            state.error = null;
        },
        clearCurrentJob: (state) => {
            state.currentJob = null;
            localStorage.removeItem('currentJobId');
            localStorage.removeItem('currentJob');
        },
        loadStoredJob: (state) => {
            const storedJobId = localStorage.getItem('currentJobId');
            const storedJob = localStorage.getItem('currentJob');
            if (storedJobId && storedJob) {
                state.currentJob = JSON.parse(storedJob);
            }
        }
    },
    extraReducers: (builder) => {
        builder
            // Create Job cases
            .addCase(createJob.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createJob.fulfilled, (state, action) => {
                state.loading = false;
                state.currentJob = action.payload;
                state.jobs = [action.payload, ...state.jobs];
                localStorage.setItem('currentJobId', action.payload.id);
                localStorage.setItem('currentJob', JSON.stringify(action.payload));
                console.log('Job created and stored:', action.payload);
            })
            .addCase(createJob.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                console.error('Create job rejected:', action.payload);
            })
            // Fetch Jobs cases
            .addCase(fetchJobs.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchJobs.fulfilled, (state, action) => {
                state.loading = false;
                state.jobs = action.payload || [];
                console.log('Jobs fetched successfully:', state.jobs.length, 'jobs');
                
                // If there's a current job ID in localStorage, find and set it
                const storedJobId = localStorage.getItem('currentJobId');
                if (storedJobId && !state.currentJob) {
                    const foundJob = state.jobs.find(job => job.id === storedJobId);
                    if (foundJob) {
                        state.currentJob = foundJob;
                        localStorage.setItem('currentJob', JSON.stringify(foundJob));
                        console.log('Restored current job from localStorage:', foundJob.title);
                    }
                }
            })
            .addCase(fetchJobs.rejected, (state, action) => {
                state.loading = false;
                state.jobs = [];
                state.error = action.payload;
                console.error('Fetch jobs rejected:', action.payload);
            })
            // Fetch Job By ID cases
            .addCase(fetchJobById.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchJobById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentJob = action.payload;
                localStorage.setItem('currentJobId', action.payload.id);
                localStorage.setItem('currentJob', JSON.stringify(action.payload));
            })
            .addCase(fetchJobById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { setCurrentJob, clearError, clearCurrentJob, loadStoredJob } = jobSlice.actions;
export default jobSlice.reducer;