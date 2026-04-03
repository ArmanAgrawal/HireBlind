import { configureStore } from '@reduxjs/toolkit';
import jobReducer from './slices/jobSlice';
import candidateReducer from './slices/candidateSlice';
import uiReducer from './slices/uiSlice';
import authReducer from './slices/authSlice'

export const store = configureStore({
    reducer: {
        jobs: jobReducer,
        candidates: candidateReducer,
        ui: uiReducer,
        auth: authReducer
    }
});