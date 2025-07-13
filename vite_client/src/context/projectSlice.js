import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";
import { BOTH_TASK_ENDPOINT } from "../utils/constant";

const projectSlice = createSlice({
  name: "project",
  initialState: {
    allProjects: [],
    projectTasks: [],
    status: 'idle',
    error: null
  },
  reducers: {
    setAllProjects: (state, action) => {
      state.allProjects = action.payload;
    },
    addProject: (state, action) => {
      const normalizedProject = {
        ...action.payload,
        projectLeader: Array.isArray(action.payload.projectLeader)
          ? action.payload.projectLeader.map(p => p._id)
          : [action.payload.projectLeader._id],
        projectMembers: action.payload.projectMembers.map(member => member._id),
      };
      state.allProjects.unshift(normalizedProject);
    },
    updateProject: (state, action) => {
      const { _id } = action.payload;
      const index = state.allProjects.findIndex(project => project._id === _id);
      if (index !== -1) {
        const normalizedProject = {
          ...action.payload,
          projectLeader: Array.isArray(action.payload.projectLeader)
            ? action.payload.projectLeader.map(p => p._id)
            : [action.payload.projectLeader._id],
          projectMembers: action.payload.projectMembers.map(member => member._id),
        };
        state.allProjects[index] = normalizedProject;
      }
    },
    deleteProject: (state, action) => {
      state.allProjects = state.allProjects.filter(
        project => project._id !== action.payload
      );
    },
    setProjectTasks: (state, action) => {
      state.projectTasks = action.payload;
    },
    setLoading: (state) => {
      state.status = 'loading';
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.status = 'failed';
    }
  }
});

// Thunk actions
export const fetchProjectTasks = (projectId, filters = {}) => async (dispatch) => {
  try {
    dispatch(setLoading());
    const queryString = new URLSearchParams(filters).toString();
    const res = await axios.get(`${BOTH_TASK_ENDPOINT}/admin/projects/${projectId}/tasks?${queryString}`, {
      withCredentials: true
    });
    dispatch(setProjectTasks(res.data.tasks));
    dispatch(setError(null));
  } catch (error) {
    dispatch(setError(error.response?.data?.error || 'Failed to fetch project tasks'));
    toast.error(error.response?.data?.error || 'Failed to fetch project tasks');
  }
};

export const { 
  setAllProjects, 
  addProject,
  updateProject,
  deleteProject,
  setProjectTasks,
  setLoading,
  setError
} = projectSlice.actions;

export default projectSlice.reducer;