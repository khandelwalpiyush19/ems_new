import { setAllProjects } from '../context/projectSlice'
import axios from 'axios'
import { useEffect,useState } from 'react'
import { useDispatch } from 'react-redux'
import { ADMIN_PROJECT_ENDPOINT } from './../utils/constant';

const useGetAllProjects = () => {
    const dispatch = useDispatch();
 


    useEffect(() => {
        const fetchAllProjects = async () => {
             console.log("Fetching projects..."); // ✅ Add this
            try {
                const res = await axios.get(`${ADMIN_PROJECT_ENDPOINT}/get-all-project`, { withCredentials: true });

                if (res.data.success && Array.isArray(res.data.projects)) {
                    const flatProjects = res.data.projects.flat(); // Flatten nested array
                    dispatch(setAllProjects(flatProjects));
                } else {
                    console.error("Unexpected structure:", res.data);
                }

            } catch (error) {
                console.error("Failed to fetch projects:", error);
            }
        };

        fetchAllProjects();
    }, [dispatch]);
    
};

export default useGetAllProjects;
