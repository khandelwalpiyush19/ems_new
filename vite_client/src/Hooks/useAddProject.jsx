import { useDispatch } from 'react-redux';
import axios from 'axios';
import { addProject } from '../context/projectSlice';
import { ADMIN_PROJECT_ENDPOINT } from './../utils/constant';

const useAddProject = () => {
  const dispatch = useDispatch();

const addNewProject = async (projectData) => {
  console.log("Adding project...", projectData);

  try {
    console.log("Sending project data:", projectData);
    const res = await axios.post(`${ADMIN_PROJECT_ENDPOINT}/create-project`, projectData, {
      withCredentials: true,
    });

    if (res.data) {
      const normalizedProject = {
        ...res.data,
        projectLeader: res.data.projectLeader?._id ? [res.data.projectLeader._id] : [],
        projectMembers: res.data.projectMembers?.map(m => m._id) || [],
      };
      dispatch(addProject(normalizedProject));
      return { success: true, project: normalizedProject };
    } else {
      console.error("Unexpected response:", res.data);
      return { success: false, error: "Invalid response structure" };
    }
  } catch (error) {
    console.error("Error adding project:", error);
    return { success: false, error };
  }
};

  return addNewProject;
};

export default useAddProject;
