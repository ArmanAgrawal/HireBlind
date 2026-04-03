import { configureStore } from '@reduxjs/toolkit';
import jobReducer from './slices/jobSlice';
import candidateReducer from './slices/candidateSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
    reducer: {
        jobs: jobReducer,
        candidates: candidateReducer,
        ui: uiReducer
    }
});