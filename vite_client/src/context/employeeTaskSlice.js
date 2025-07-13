import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";
import { BOTH_TASK_ENDPOINT } from "../utils/constant";

const initialState = {
  myProjects: [],
  myTasks: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null
};

const employeeTaskSlice = createSlice({
  name: "employeeTask",
  initialState,
  reducers: {
    setMyProjects: (state, action) => {
      state.myProjects = action.payload;
    },
    setMyTasks: (state, action) => {
      state.myTasks = action.payload;
    },
    addTask: (state, action) => {
      state.myTasks.unshift(action.payload);
    },
    updateTask: (state, action) => {
      const index = state.myTasks.findIndex(task => task._id === action.payload._id);
      if (index !== -1) {
        state.myTasks[index] = action.payload;
      }
    },
    setLoading: (state) => {
      state.status = 'loading';
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.status = 'failed';
    },
    resetTaskState: (state) => {
      return initialState;
    }
  }
});

// Thunk actions
export const fetchMyProjects = () => async (dispatch) => {
  try {
    dispatch(setLoading());
    const res = await axios.get(`${BOTH_TASK_ENDPOINT}/get-my-projects`, { 
      withCredentials: true 
    });
    dispatch(setMyProjects(res.data.projects));
    dispatch(setError(null));
  } catch (error) {
    dispatch(setError(error.response?.data?.error || 'Failed to fetch projects'));
    toast.error(error.response?.data?.error || 'Failed to fetch projects');
  }
};

export const fetchMyTasks = (filters = {}) => async (dispatch) => {
  try {
    dispatch(setLoading());
    const queryString = new URLSearchParams(filters).toString();
    const res = await axios.get(`${BOTH_TASK_ENDPOINT}/all-tasks?${queryString}`, { 
      withCredentials: true 
    });
    dispatch(setMyTasks(res.data.tasks));
    dispatch(setError(null));
  } catch (error) {
    dispatch(setError(error.response?.data?.error || 'Failed to fetch tasks'));
    toast.error(error.response?.data?.error || 'Failed to fetch tasks');
  }
};

export const createNewTask = (taskData) => async (dispatch) => {
  try {
    dispatch(setLoading());
    const res = await axios.post(`${BOTH_TASK_ENDPOINT}/create-task`, taskData, { 
      withCredentials: true 
    });
    dispatch(addTask(res.data.task));
    toast.success('Task created successfully!');
    return { success: true, task: res.data.task };
  } catch (error) {
    dispatch(setError(error.response?.data?.error || 'Failed to create task'));
    toast.error(error.response?.data?.error || 'Failed to create task');
    return { success: false, error };
  }
};

export const updateExistingTask = (taskId, updateData) => async (dispatch) => {
  try {
    dispatch(setLoading());
    const res = await axios.put(`${BOTH_TASK_ENDPOINT}/task-status/${taskId}`, updateData, { 
      withCredentials: true 
    });
    dispatch(updateTask(res.data.task));
    toast.success('Task updated successfully!');
    return { success: true, task: res.data.task };
  } catch (error) {
    dispatch(setError(error.response?.data?.error || 'Failed to update task'));
    toast.error(error.response?.data?.error || 'Failed to update task');
    return { success: false, error };
  }
};

export const { 
  setMyProjects, 
  setMyTasks,
  addTask,
  updateTask,
  setLoading,
  setError,
  resetTaskState
} = employeeTaskSlice.actions;

export default employeeTaskSlice.reducer;