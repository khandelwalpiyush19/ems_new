import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { updatePayroll } from '../context/payrollSlice'; // Ensure this exists
import { ADMIN_PAYROLL_ENDPOINT } from './../utils/constant';

const useUpdatePayroll = () => {
  const dispatch = useDispatch();
const employeesObj = useSelector((state) => state.employees?.employees?.employees || {});
const employees = employeesObj ? Object.values(employeesObj) : [];



  const updateEmployeePayroll = async (employeeId, payrollData) => {
    console.log(`Updating payroll for employee ID: ${employeeId}`, payrollData);

    try {
      const res = await axios.put(
        `${ADMIN_PAYROLL_ENDPOINT}/update-payroll/${employeeId}`,
        payrollData,
        {
          withCredentials: true,
        }
      );

      if (res.data?.updatedPayroll) {
        dispatch(updatePayroll(res.data.updatedPayroll));
        return { success: true, payroll: res.data.updatedPayroll };
      } else {
        console.error("Unexpected response:", res.data);
        return { success: false, error: "Invalid response structure" };
      }
    } catch (error) {
      console.error("Error updating payroll:", error);
      return { success: false, error };
    }
  };

  return { employees, updateEmployeePayroll };
};

export default useUpdatePayroll;
