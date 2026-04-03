import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { candidatesAPI, decisionsAPI } from '../api';

export const fetchCandidates = createAsyncThunk(
    'candidates/fetch',
    async (jobId, { rejectWithValue }) => {
        try {
            const response = await candidatesAPI.getAll(jobId);
            return Array.isArray(response) ? response : [];
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const submitDecision = createAsyncThunk(
    'candidates/decide',
    async (decisionData, { rejectWithValue }) => {
        try {
            const response = await decisionsAPI.create(decisionData);
            return { response, decisionData };
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const revealIdentity = createAsyncThunk(
    'candidates/reveal',
    async (candidateId, { rejectWithValue }) => {
        try {
            const response = await candidatesAPI.reveal(candidateId);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const candidateSlice = createSlice({
    name: 'candidates',
    initialState: {
        list: [], // Always an array
        selectedCandidate: null,
        revealedData: null,
        loading: false,
        error: null
    },
    reducers: {
        selectCandidate: (state, action) => {
            state.selectedCandidate = action.payload;
        },
        clearRevealedData: (state) => {
            state.revealedData = null;
        },
        clearCandidates: (state) => {
            state.list = [];
            state.selectedCandidate = null;
            state.revealedData = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCandidates.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCandidates.fulfilled, (state, action) => {
                state.loading = false;
                state.list = action.payload || [];
            })
            .addCase(fetchCandidates.rejected, (state, action) => {
                state.loading = false;
                state.list = [];
                state.error = action.payload;
            })
            .addCase(submitDecision.pending, (state) => {
                state.loading = true;
            })
            .addCase(submitDecision.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(submitDecision.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(revealIdentity.pending, (state) => {
                state.loading = true;
            })
            .addCase(revealIdentity.fulfilled, (state, action) => {
                state.loading = false;
                state.revealedData = action.payload;
            })
            .addCase(revealIdentity.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { selectCandidate, clearRevealedData, clearCandidates } = candidateSlice.actions;
export default candidateSlice.reducer;