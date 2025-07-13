import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { BOTH_PROFILE_ENDPOINT } from '../utils/constant';
// Base URL
const API_URL = 'http://localhost:5000/api/v1';

// Async thunk for fetching employee details
export const fetchEmployeeDetails = createAsyncThunk(
  'employeeDetails/fetchEmployeeDetails',
  async (employeeId, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${BOTH_PROFILE_ENDPOINT}/admin/get-info/${employeeId}`,
        { withCredentials: true }
      );
      return response.data.employee;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch employee details');
    }
  }
);

// Async thunk for updating employee status(Active or inactive )
export const updateEmployeeStatus = createAsyncThunk(
  'employeeDetails/updateEmployeeStatus',
  async ({ employeeId, active }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(
        `${BOTH_PROFILE_ENDPOINT}/admin/update-status/${employeeId}`,
        { active },
        { withCredentials: true }
      );
      return response.data.employee;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Async thunk for updating employee info (Address and phone numbers )
export const updateEmployeeInfo = createAsyncThunk(
  'employeeDetails/updateEmployeeInfo',
  async (updateData, { rejectWithValue, getState }) => {
    try {
      const { employee } = getState().employeeDetails;
      const response = await axios.put(
        `${BOTH_PROFILE_ENDPOINT}/update-info`,
        updateData,
        { withCredentials: true }
      );
      return { ...employee, ...response.data.employee };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update employee info');
    }
  }
);

// Async thunk for adding academic record
export const addAcademicRecord = createAsyncThunk(
  'employeeDetails/addAcademicRecord',
  async ({ institution, details }, { rejectWithValue, getState }) => {
    try {
      const { employee } = getState().employeeDetails;
      const response = await axios.post(
        `${BOTH_PROFILE_ENDPOINT}/add-academic-record`,
        { institution, details },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      // Return the updated employee with new academicRecords
      return {
        ...employee,
        academicRecords: response.data.academicRecords // Changed from response.data.record
      };
    } catch (error) {
      console.error('API Error:', error.response?.data);
      return rejectWithValue(error.response?.data?.message || 'Failed to add academic record');
    }
  }
);
// Async thunk for adding guarantor details
export const addGuarantor = createAsyncThunk(
  'employeeDetails/addGuarantor',
  async (guarantorData, { rejectWithValue }) => {
    try {
      // Transform data to match backend expectations
      const backendData = {
        name: guarantorData.name,
        occupation: guarantorData.occupation,
        phone: guarantorData.phoneNumber, // Map phoneNumber to phone
        relationship: guarantorData.relationship,
        address: guarantorData.address
      };

      const response = await axios.post(
        `${BOTH_PROFILE_ENDPOINT}/add-guarantor-detail`,
        backendData,
        { withCredentials: true }
      );
      return response.data.guarantors;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add guarantor');
    }
  }
);
// Async thunk for adding professional qualification
export const addProfessionalQualification = createAsyncThunk(
  'employeeDetails/addProfessionalQualification',
  async (qualificationData, { rejectWithValue, getState }) => {
    try {
      console.log('Sending professional qualification:', qualificationData);
      const response = await axios.post(
        `${BOTH_PROFILE_ENDPOINT}/add-professional-qualification`,
        qualificationData,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      console.log('API Response:', response.data);
      return response.data.professionalQualifications;
    } catch (error) {
      console.error('API Error Details:', {
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers
      });
      return rejectWithValue(
        error.response?.data?.message ||
        error.message ||
        'Failed to add professional qualification'
      );
    }
  }
);

// Async thunk for adding next of kin
export const addNextOfKin = createAsyncThunk(
  'employeeDetails/addNextOfKin',
  async (nextOfKinData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${BOTH_PROFILE_ENDPOINT}/add-nok-detail`, // Ensure this is employee endpoint
        nextOfKinData,
        {
          withCredentials: true, // Crucial for cookie-based auth
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data.nextOfKin;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Failed to add next of kin'
      );
    }
  }
);
// Async thunk for adding family details
export const addFamilyDetail = createAsyncThunk(
  'employeeDetails/addFamilyDetail',
  async (familyData, { rejectWithValue, getState }) => {
    try {
      const { employee } = getState().employeeDetails;
      const response = await axios.post(
        `${BOTH_PROFILE_ENDPOINT}/add-family-detail`,
        familyData,
        { withCredentials: true }
      );

      // Check if backend returned an array
      const addedFamilyDetails = response.data.familyDetails;
      if (!addedFamilyDetails || !Array.isArray(addedFamilyDetails) || addedFamilyDetails.length === 0) {
        return rejectWithValue('Family detail not returned from server');
      }
console.log('Server response:', response.data);

      return {
        ...employee,
        familyDetails: [...(employee.familyDetails || []), addedFamilyDetails.at(-1)]
      };
    } catch (error) {
  console.error('Thunk error:', error);
  return rejectWithValue(error.response?.data?.message || error.message || 'Failed to add family detail');
}

  }
);

// Async thunk for updating financial details
export const updateFinancialDetails = createAsyncThunk(
  'employeeDetails/updateFinancialDetails',
  async (financialData, { rejectWithValue, getState }) => {
    try {
      const { employee } = getState().employeeDetails;
      const response = await axios.put(
        `${BOTH_PROFILE_ENDPOINT}/update-financial-details`,
        financialData,
        { withCredentials: true }
      );
      return {
        ...employee,
        financialDetails: response.data.financialDetails
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update financial details');
    }
  }
);

//Asyn thunk for fetching employee's own info
export const fetchEmployeeOwnInfo = createAsyncThunk(
  'employeeDetails/fetchEmployeeOwnInfo',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${BOTH_PROFILE_ENDPOINT}/get-my-details`,
        { withCredentials: true }
      );
      return response.data.employee;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch your information');
    }
  }
);

const employeeDetailsSlice = createSlice({
  name: 'employeeDetails',
  initialState: {
    employee: null,
    loading: false,
    error: null,
    updatingStatus: false,
    statusUpdateError: null,
    updatingInfo: false,
    addingRecord: false,
    addingGuarantor: false,
    addingQualification: false,
    addingNextOfKin: false,
    addingFamilyDetail: false,
    updatingFinancialDetails: false
  },
  reducers: {
    clearEmployeeDetails: (state) => {
      state.employee = null;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch employee details cases
      .addCase(fetchEmployeeDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployeeDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.employee = action.payload;
      })
      .addCase(fetchEmployeeDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

       // Fetch employee's own info cases
      .addCase(fetchEmployeeOwnInfo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployeeOwnInfo.fulfilled, (state, action) => {
        state.loading = false;
        state.employee = action.payload;
      })
      .addCase(fetchEmployeeOwnInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update employee status cases
      .addCase(updateEmployeeStatus.pending, (state) => {
        state.updatingStatus = true;
        state.statusUpdateError = null;
      })
      .addCase(updateEmployeeStatus.fulfilled, (state, action) => {
        state.updatingStatus = false;
        state.employee = action.payload;
      })
      .addCase(updateEmployeeStatus.rejected, (state, action) => {
        state.updatingStatus = false;
        state.statusUpdateError = action.payload;
      })

      // Update employee info cases
      .addCase(updateEmployeeInfo.pending, (state) => {
        state.updatingInfo = true;
      })
      .addCase(updateEmployeeInfo.fulfilled, (state, action) => {
        state.updatingInfo = false;
        state.employee = action.payload;
      })
      .addCase(updateEmployeeInfo.rejected, (state, action) => {
        state.updatingInfo = false;
        state.error = action.payload;
      })

      // Add academic record cases
      .addCase(addAcademicRecord.pending, (state) => {
        state.addingRecord = true;
      })
      .addCase(addAcademicRecord.fulfilled, (state, action) => {
        state.addingRecord = false;
        state.employee = action.payload;
      })
      .addCase(addAcademicRecord.rejected, (state, action) => {
        state.addingRecord = false;
        state.error = action.payload;
      })

      // Add guarantor details cases
      .addCase(addGuarantor.pending, (state) => {
        state.updatingGuarantor = true;
        state.guarantorError = null;
      })
      .addCase(addGuarantor.fulfilled, (state, action) => {
        state.addingGuarantor = false;
        if (state.employee) {
          // Ensure we're properly merging the new guarantor with existing ones
          state.employee.guarantors = action.payload;
          // Or if the response returns just the new guarantor:
          // state.employee.guarantors = [...(state.employee.guarantors || []), action.payload];
        }
      })
      .addCase(addGuarantor.rejected, (state, action) => {
        state.updatingGuarantor = false;
        state.guarantorError = action.payload;
      })

      // Add professional qualification cases
      .addCase(addProfessionalQualification.pending, (state) => {
        state.addingQualification = true;
      })
      .addCase(addProfessionalQualification.fulfilled, (state, action) => {
        state.addingQualification = false;
        if (state.employee) {
          state.employee.professionalQualifications = action.payload;
        }
      })
      .addCase(addProfessionalQualification.rejected, (state, action) => {
        state.addingQualification = false;
        state.error = action.payload;
      })

      // Add next of kin cases
      .addCase(addNextOfKin.pending, (state) => {
        state.addingNextOfKin = true;
      })
      .addCase(addNextOfKin.fulfilled, (state, action) => {
        state.addingNextOfKin = false;
        state.employee = action.payload;
      })
      .addCase(addNextOfKin.rejected, (state, action) => {
        state.addingNextOfKin = false;
        state.error = action.payload;
      })

      // Add family detail cases
      .addCase(addFamilyDetail.pending, (state) => {
        state.addingFamilyDetail = true;
      })
      .addCase(addFamilyDetail.fulfilled, (state, action) => {
        state.addingFamilyDetail = false;
        state.employee = action.payload;
      })
      .addCase(addFamilyDetail.rejected, (state, action) => {
        state.addingFamilyDetail = false;
        state.error = action.payload;
      })

      // Update financial details cases
      .addCase(updateFinancialDetails.pending, (state) => {
        state.updatingFinancialDetails = true;
      })
      .addCase(updateFinancialDetails.fulfilled, (state, action) => {
        state.updatingFinancialDetails = false;
        state.employee = action.payload;
      })
      .addCase(updateFinancialDetails.rejected, (state, action) => {
        state.updatingFinancialDetails = false;
        state.error = action.payload;
      });
  }
});

export const { clearEmployeeDetails } = employeeDetailsSlice.actions;
export default employeeDetailsSlice.reducer;