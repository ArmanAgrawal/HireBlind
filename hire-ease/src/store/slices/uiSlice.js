import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
    name: 'ui',
    initialState: {
        loading: false,
        alert: null,
        modalOpen: false,
        modalContent: null
    },
    reducers: {
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        showAlert: (state, action) => {
            state.alert = action.payload;
        },
        hideAlert: (state) => {
            state.alert = null;
        },
        openModal: (state, action) => {
            state.modalOpen = true;
            state.modalContent = action.payload;
        },
        closeModal: (state) => {
            state.modalOpen = false;
            state.modalContent = null;
        }
    }
});

export const { setLoading, showAlert, hideAlert, openModal, closeModal } = uiSlice.actions;
export default uiSlice.reducer;