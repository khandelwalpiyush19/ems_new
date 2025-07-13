// useUpdateProject.js
import { useDispatch } from 'react-redux';
import { updateProject } from '../context/projectSlice';
import axios from 'axios';
import { ADMIN_PROJECT_ENDPOINT } from '../utils/constant';

const useUpdateProject = () => {
  const dispatch = useDispatch();

  const handleUpdateProject = async (projectId, updatedData) => {
    try {
      const res = await axios.put(
        `${ADMIN_PROJECT_ENDPOINT}/update-project/${projectId}`,
        updatedData,
        { withCredentials: true }
      );

      if (res.data.success) {
        dispatch(updateProject(res.data.project));
        return { success: true, project: res.data.project };
      } else {
        return { success: false, error: res.data.error || 'Failed to update project' };
      }
    } catch (error) {
      console.error("Error updating project:", error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to update project' 
      };
    }
  };

  return handleUpdateProject;
};

export default useUpdateProject;