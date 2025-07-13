// redux/slices/payrollSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { ADMIN_PAYROLL_ENDPOINT } from '../utils/constant';

export const fetchPayrolls = createAsyncThunk(
  'payroll/fetchPayrolls',
  async ({ month, year }, thunkAPI) => {
    try {
      const response = await axios.get(
        `${ADMIN_PAYROLL_ENDPOINT}/get-all-employee-payroll?month=${month}&year=${year}`,
        { withCredentials: true }
      );
      // Assuming the API returns an array directly
      return Array.isArray(response.data) ? response.data : [response.data];
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updatePayroll = createAsyncThunk(
  'payroll/updatePayroll',
  async ({ payrollId, updatedData }, thunkAPI) => {
    try {
      const response = await axios.patch(
        `${ADMIN_PAYROLL_ENDPOINT}/update-payroll/${payrollId}`,
        updatedData,
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);


const payrollSlice = createSlice({
  name: 'payroll',
  initialState: {
    data: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPayrolls.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchPayrolls.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
      })
      .addCase(fetchPayrolls.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(updatePayroll.fulfilled, (state, action) => {
        const updated = action.payload.data;
        const index = state.data.findIndex((p) => p._id === updated._id);
        if (index !== -1) {
          state.data[index] = updated;
        }
      });
  },
});

export default payrollSlice.reducer;
