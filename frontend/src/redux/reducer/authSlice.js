import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  token: localStorage.getItem('access_token') || null,
  isLoggedIn: !!localStorage.getItem('access_token'),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken(state, action) {
      state.token = action.payload;
      state.isLoggedIn = true;
      localStorage.setItem('access_token', action.payload);
    },
    clearToken(state) {
      state.token = null;
      state.isLoggedIn = false;
      localStorage.removeItem('access_token');
    },
  },
});

export const { setToken, clearToken } = authSlice.actions;
export default authSlice.reducer;