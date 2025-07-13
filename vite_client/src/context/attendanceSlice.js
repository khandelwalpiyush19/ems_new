import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { BOTH_ATTENDANCE_ENDPOINT } from './../utils/constant';

// Thunks

export const clockIn = createAsyncThunk(
  "attendance/clockIn",
  async (workLocation, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("employeeToken");
      const res = await axios.post(
        `${BOTH_ATTENDANCE_ENDPOINT}/clock-in`,
        { workLocation },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      return res.data;
    } catch (err) {
      console.error("Clock-in error:", err.response?.data);
      return rejectWithValue({
        message: err.response?.data?.message || "Clock-in failed",
        status: err.response?.status,
        data: err.response?.data
      });
    }
  }
);

export const clockOut = createAsyncThunk(
  'attendance/clockOut',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${BOTH_ATTENDANCE_ENDPOINT}/clock-out`, null, {
        withCredentials: true
      });
      return res.data;
    } catch (err) {
      console.error("Clock-out error:", err.response?.data);
      return rejectWithValue({
        message: err.response?.data?.message || "Clock-out failed",
        status: err.response?.status,
        data: err.response?.data
      });
    }
  }
);

export const breakIn = createAsyncThunk(
  'attendance/breakIn',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${BOTH_ATTENDANCE_ENDPOINT}/break-in`, null, {
        withCredentials: true
      });
      return res.data;
    } catch (err) {
      console.error("Break-in error:", err.response?.data);
      return rejectWithValue({
        message: err.response?.data?.message || "Break-in failed",
        status: err.response?.status,
        data: err.response?.data
      });
    }
  }
);

export const breakOut = createAsyncThunk(
  'attendance/breakOut',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${BOTH_ATTENDANCE_ENDPOINT}/break-out`, null, {
        withCredentials: true
      });
      return res.data;
    } catch (err) {
      console.error("Break-out error:", err.response?.data);
      return rejectWithValue({
        message: err.response?.data?.message || "Break-out failed",
        status: err.response?.status,
        data: err.response?.data
      });
    }
  }
);

export const fetchLogs = createAsyncThunk(
  'attendance/fetchLogs',
  async (params, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${BOTH_ATTENDANCE_ENDPOINT}/get-logs`, {
        params,
        withCredentials: true
      });
      return res.data;
    } catch (err) {
      console.error("Fetch logs error:", err.response?.data);
      return rejectWithValue({
        message: err.response?.data?.message || "Failed to fetch logs",
        status: err.response?.status,
        data: err.response?.data
      });
    }
  }
);

export const fetchTodayStatus = createAsyncThunk(
  'attendance/fetchTodayStatus',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${BOTH_ATTENDANCE_ENDPOINT}/today-status`, {
        withCredentials: true
      });
      return res.data;
    } catch (err) {
      console.error("Today status fetch error:", err.response?.data);
      return rejectWithValue({
        message: err.response?.data?.message || "Failed to get today status",
        status: err.response?.status,
        data: err.response?.data
      });
    }
  }
);

export const fetchAllAttendanceStats = createAsyncThunk(
  'attendance/fetchAllStats',
  async (params, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${BOTH_ATTENDANCE_ENDPOINT}/all-employee-list`, {
        params,
        withCredentials: true
      });
      return res.data;
    } catch (err) {
      console.error("Stats fetch error:", err.response?.data);
      return rejectWithValue({
        message: err.response?.data?.message || "Failed to get stats",
        status: err.response?.status,
        data: err.response?.data
      });
    }
  }
);

export const fetchEmployeeList = createAsyncThunk(
  'attendance/fetchEmployeeList',
  async (params, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${BOTH_ATTENDANCE_ENDPOINT}/all-employee-list`, {
        params: {
          department: params?.department,
          includeInactive: params?.includeInactive
        },
        withCredentials: true
      });
      return res.data;
    } catch (err) {
      console.error("Employee list fetch error:", err.response?.data);
      return rejectWithValue({
        message: err.response?.data?.message || "Failed to get employee list",
        status: err.response?.status,
        data: err.response?.data
      });
    }
  }
);

export const fetchEmployeeAttendanceDetails = createAsyncThunk(
  'attendance/fetchEmployeeDetails',
  async ({ employeeId, params }, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${BOTH_ATTENDANCE_ENDPOINT}/employee/${employeeId}/attendance`, {
        params: {
          startDate: params?.startDate,
          endDate: params?.endDate
        },
        withCredentials: true
      });
      return res.data;
    } catch (err) {
      console.error("Employee details fetch error:", err.response?.data);
      return rejectWithValue({
        message: err.response?.data?.message || "Failed to get employee details",
        status: err.response?.status,
        data: err.response?.data
      });
    }
  }
);

// Slice

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState: {
    loading: false,
    error: null,
    sessions: [],
    summary: null,
    dailyStats: null,
    todayStatus: [],
    adminStats: [],
    breakSession: null,
    employeeList: [],
    employeeAttendanceDetails: null,
    employeeStats: null
  },
  reducers: {
    resetAttendance: (state) => {
      state.loading = false;
      state.error = null;
      state.sessions = [];
      state.summary = null;
      state.dailyStats = null;
      state.todayStatus = [];
      state.adminStats = [];
      state.breakSession = null;
      state.employeeList = [];
      state.employeeDetails = null;
      state.employeeStats = null;
    },
    clearEmployeeDetails: (state) => {
      state.employeeDetails = null;
      state.employeeStats = null;
    }
  },
  extraReducers: (builder) => {
    const pending = (state) => {
      state.loading = true;
      state.error = null;
    };

    const rejected = (state, action) => {
      state.loading = false;
      state.error = action.payload;
    };

    builder
      .addCase(clockIn.pending, pending)
      .addCase(clockIn.fulfilled, (state, action) => {
        state.loading = false;
        state.sessions.push(action.payload);
      })
      .addCase(clockIn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        if (action.payload?.data?.session) {
          state.sessions = [action.payload.data.session];
        }
      })

      .addCase(clockOut.pending, pending)
      .addCase(clockOut.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.sessions.findIndex(s => s._id === action.payload._id);
        if (index !== -1) state.sessions[index] = action.payload;
      })
      .addCase(clockOut.rejected, rejected)

      .addCase(breakIn.pending, pending)
      .addCase(breakIn.fulfilled, (state, action) => {
        state.loading = false;
        state.breakSession = action.payload;
      })
      .addCase(breakIn.rejected, rejected)

      .addCase(breakOut.pending, pending)
      .addCase(breakOut.fulfilled, (state, action) => {
        state.loading = false;
        state.breakSession = null;
        const index = state.sessions.findIndex(s => s._id === action.payload._id);
        if (index !== -1) state.sessions[index] = action.payload;
      })
      .addCase(breakOut.rejected, rejected)

      .addCase(fetchLogs.pending, pending)
      .addCase(fetchLogs.fulfilled, (state, action) => {
        state.loading = false;
        state.sessions = action.payload.sessions || [];
        state.summary = action.payload.summary || {};
      })
      .addCase(fetchLogs.rejected, rejected)

      .addCase(fetchTodayStatus.pending, pending)
      .addCase(fetchTodayStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.todayStatus = action.payload || [];
      })
      .addCase(fetchTodayStatus.rejected, rejected)

      .addCase(fetchAllAttendanceStats.pending, pending)
      .addCase(fetchAllAttendanceStats.fulfilled, (state, action) => {
        state.loading = false;
        state.adminStats = action.payload?.stats || [];
      })
      .addCase(fetchAllAttendanceStats.rejected, rejected)

      .addCase(fetchEmployeeList.pending, pending)
      .addCase(fetchEmployeeList.fulfilled, (state, action) => {
        state.loading = false;
        state.employeeList = action.payload?.employees || [];
      })
      .addCase(fetchEmployeeList.rejected, rejected)

      .addCase(fetchEmployeeAttendanceDetails.pending, pending)
      .addCase(fetchEmployeeAttendanceDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.employeeDetails = action.payload?.employee || null;
        state.employeeStats = {
          period: action.payload?.period,
          statistics: action.payload?.statistics,
          recentRecords: action.payload?.recentRecords
        };
      })
      .addCase(fetchEmployeeAttendanceDetails.rejected, rejected);
  }
});

export const { resetAttendance, clearEmployeeDetails } = attendanceSlice.actions;
export default attendanceSlice.reducer;