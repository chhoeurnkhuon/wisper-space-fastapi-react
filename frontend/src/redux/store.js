import { configureStore } from '@reduxjs/toolkit';
import authReducer from './reducer/authSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    // other reducers...
  },
});

export default store;
