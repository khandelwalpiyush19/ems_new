import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { ADMIN_AUTH_ENDPOINT, EMPLOYEE_AUTH_ENDPOINT } from './../../utils/constant';

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (userEmail, { rejectWithValue }) => {
    try {
      let endpoint = '/api/v1/auth/logout'; // Default endpoint
      
      // Determine endpoint based on user email
      if (userEmail.endsWith('@gmail.com')) {
        endpoint = `ADMIN_AUTH_ENDPOINT/logout`;
      } else if (userEmail.endsWith('@paarsiv.com')) {
        endpoint = `EMPLOYEE_AUTH_ENDPOINT/logout`;
      }

      await axios.post(endpoint, {}, {
        withCredentials: true
      });
      return true;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Logout failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    loading: false,
    user: null,
    error: null,
  },
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.user = null; // Still clear user even if API fails
        state.error = action.payload;
      });
  },
});

export const { setLoading, setUser } = authSlice.actions;
export default authSlice.reducer;