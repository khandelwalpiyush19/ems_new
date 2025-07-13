// redux/slices/notificationSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { BOTH_NOTIFICATION_ENDPOINT } from '../utils/constant';

// Create new notification (admin only)
export const createNotification = createAsyncThunk(
  'notifications/create',
  async (message, thunkAPI) => {
    try {
      const res = await axios.post(
        `${BOTH_NOTIFICATION_ENDPOINT}/create-notification`,
        { message },
        { withCredentials: true }
      );
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    list: [],
    status: 'idle',
    error: null,
  },
  reducers: {
    addNotification(state, action) {
      state.list.unshift(...action.payload); // Add latest notifications on top
    },
    clearNotifications(state) {
      state.list = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createNotification.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createNotification.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Optionally add to list if admin wants real-time view
        state.list.unshift(action.payload);
      })
      .addCase(createNotification.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { addNotification, clearNotifications } = notificationSlice.actions;

export default notificationSlice.reducer;
