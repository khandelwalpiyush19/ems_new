// useDeleteProject.js
import { useDispatch } from 'react-redux';
import { deleteProject } from '../context/projectSlice';
import axios from 'axios';
import { ADMIN_PROJECT_ENDPOINT } from '../utils/constant';

const useDeleteProject = () => {
  const dispatch = useDispatch();

  const handleDeleteProject = async (projectId) => {
    try {
      const res = await axios.delete(
        `${ADMIN_PROJECT_ENDPOINT}/delete-project/${projectId}`,
        { withCredentials: true }
      );

      if (res.data.success) {
        dispatch(deleteProject(projectId));
        return { success: true };
      } else {
        return { success: false, error: res.data.error || 'Failed to delete project' };
      }
    } catch (error) {
      console.error("Error deleting project:", error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to delete project' 
      };
    }
  };

  return handleDeleteProject;
};

export default useDeleteProject;