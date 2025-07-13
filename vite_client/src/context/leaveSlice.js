// features/leave/leaveSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { ADMIN_LEAVE_ENDPOINT } from '../utils/constant';

// Async thunk to get all leaves
export const getAllLeaves = createAsyncThunk(
  'leave/getAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${ADMIN_LEAVE_ENDPOINT}/get-all-leaves`,{
  withCredentials: true
});
      return response.data.leaves;
    } catch (err) {
      return rejectWithValue(err.response.data || err.message);
    }
  }
);

// Async thunk to update a leave
export const updateLeave = createAsyncThunk(
  'leave/update',
  async ({ id, updatedData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${ADMIN_LEAVE_ENDPOINT}/update-leave-status/${id}`, updatedData ,{
  withCredentials: true
});
      return response.data.leaves;
    } catch (err) {
      return rejectWithValue(err.response.data || err.message);
    }
  }
);

const leaveSlice = createSlice({
  name: 'leave',
  initialState: {
    leaves: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Get all leaves
      .addCase(getAllLeaves.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllLeaves.fulfilled, (state, action) => {
        state.loading = false;
        state.leaves = action.payload;
      })
      .addCase(getAllLeaves.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update leave
      .addCase(updateLeave.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateLeave.fulfilled, (state, action) => {
  state.loading = false;
  // Replace all leaves with updated leaves array from backend
  state.leaves = action.payload;
})

      .addCase(updateLeave.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default leaveSlice.reducer;
