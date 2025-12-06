import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../store/authSlice';
import userSlice from './userSlice';
import uiSlice from './uiSlice';

const store =  configureStore({
    reducer: {
        user: userSlice.reducer,
        auth: authReducer,
        ui: uiSlice.reducer
    },
});

export default store;