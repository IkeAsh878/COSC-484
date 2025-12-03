import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../store/authSlice';
import userSlice from './userSlice';

const store =  configureStore({
    reducer: {
        user: userSlice.reducer,
        auth: authReducer,
    },
});

export default store;