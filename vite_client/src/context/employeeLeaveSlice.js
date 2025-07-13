import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { EMPLOYEE_LEAVE_ENDPOINT } from '../utils/constant'; // You'll define this

// Submit leave request
export const submitLeave = createAsyncThunk(
  'employeeLeave/submitLeave',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${EMPLOYEE_LEAVE_ENDPOINT}/create-leave`,
        data,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Something went wrong');
    }
  }
);



// (Optional) Get employee's own leaves
export const getEmployeeLeaves = createAsyncThunk(
  'employeeLeave/getMyLeaves',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${EMPLOYEE_LEAVE_ENDPOINT}/get-my-leaves`, {
        withCredentials: true,
      });
      return {
        leaves: response.data.leaves,
        statistics: response.data.statistics,
      };
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);


const employeeLeaveSlice = createSlice({
  name: 'employeeLeave',
  initialState: {
    myLeaves: [],
     leaveStats: null,
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    resetStatus: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitLeave.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(submitLeave.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.myLeaves.push(action.payload);
      })
      .addCase(submitLeave.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      .addCase(getEmployeeLeaves.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getEmployeeLeaves.fulfilled, (state, action) => {
  state.loading = false;
  state.myLeaves = action.payload.leaves;
  state.leaveStats = action.payload.statistics; // <-- capture stats
})
      .addCase(getEmployeeLeaves.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetStatus } = employeeLeaveSlice.actions;
export default employeeLeaveSlice.reducer;

