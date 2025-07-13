import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchEmployeeDetails,
  addAcademicRecord,
  addProfessionalQualification
} from '../../context/employeeDetailsSlice';

const EducationQualifications = () => {
  const dispatch = useDispatch();
  const { employee, loading, error } = useSelector(state => state.employeeDetails);

  const [academicInput, setAcademicInput] = useState({ institution: '', details: '' });
  const [professionalInput, setProfessionalInput] = useState({
    title: '',
    organization: '',
    duration: '',
    description: ''
  });

  const [showAcademicForm, setShowAcademicForm] = useState(false);
  const [showProfessionalForm, setShowProfessionalForm] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    dispatch(fetchEmployeeDetails());
  }, [dispatch]);

  const handleAddAcademic = async () => {
    if (!academicInput.institution || !academicInput.details) {
      setApiError('Institution and details are required');
      return;
    }

    setApiError(null);
    setSuccessMessage(null);

    try {
      const result = await dispatch(addAcademicRecord({
        institution: academicInput.institution,
        details: academicInput.details
      }));

      if (addAcademicRecord.fulfilled.match(result)) {
        setSuccessMessage('Academic record added successfully!');
        setAcademicInput({ institution: '', details: '' });
        setShowAcademicForm(false);
        dispatch(fetchEmployeeDetails());
      } else {
        setApiError(result.payload || 'Failed to add academic record');
      }
    } catch (error) {
      setApiError(error.message);
    }
  };

  const handleAddProfessional = async () => {
    if (!professionalInput.title || !professionalInput.organization) {
      setApiError('Title and organization are required');
      return;
    }

    setApiError(null);
    setSuccessMessage(null);

    try {
      const result = await dispatch(addProfessionalQualification({
        title: professionalInput.title,
        organization: professionalInput.organization,
        duration: professionalInput.duration,
        description: professionalInput.description
      }));

      if (addProfessionalQualification.fulfilled.match(result)) {
        setSuccessMessage('Professional qualification added successfully!');
        setProfessionalInput({
          title: '',
          organization: '',
          duration: '',
          description: ''
        });
        setShowProfessionalForm(false);
        dispatch(fetchEmployeeDetails());
      } else {
        const errorMessage = result.payload || 'Failed to add professional qualification';
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Detailed error:', {
        message: error.message,
        stack: error.stack
      });
      setApiError(error.message);
    }
  };

  if (loading) return <div className="text-center py-8">Loading qualifications...</div>;

  return (
    <div className="pl-0 lg:pl-64 pr-0 lg:pr-64 w-full min-h-screen bg-gray-50">
      {/* Main content container with proper spacing for both sidebars */}
      <div className="mx-auto w-full max-w-[calc(100vw-32rem)] px-4 sm:px-6 py-6">
        {/* Error and Success Messages */}
        {apiError && (
          <div className="mb-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
            <p>{apiError}</p>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-4 bg-green-100 border-l-4 border-green-500 text-green-700">
            <p>{successMessage}</p>
          </div>
        )}

        {/* Academic Records Section */}
        <div className="mb-8 bg-white p-6 rounded-lg shadow">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
            <h2 className="text-xl font-bold text-gray-800">Academic Records</h2>
            <button
              onClick={() => {
                setShowAcademicForm(!showAcademicForm);
                setShowProfessionalForm(false);
                setApiError(null);
                setSuccessMessage(null);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition w-full sm:w-auto"
            >
              {showAcademicForm ? 'Cancel' : 'Add Academic Record'}
            </button>
          </div>

          {showAcademicForm && (
            <div className="mb-6 space-y-3">
              <input
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Institution"
                value={academicInput.institution}
                onChange={(e) => setAcademicInput({ ...academicInput, institution: e.target.value })}
              />
              <input
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Details (e.g., Degree, Dates)"
                value={academicInput.details}
                onChange={(e) => setAcademicInput({ ...academicInput, details: e.target.value })}
              />
              <button
                onClick={handleAddAcademic}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition w-full sm:w-auto"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          )}

          {(!employee?.academicRecords || employee.academicRecords.length === 0) ? (
            <p className="text-center text-gray-500 py-4">No academic records added yet.</p>
          ) : (
            <div className="space-y-4">
              {employee.academicRecords
                .slice(-3)
                .reverse()
                .map((record, index) => (
                  <div key={record._id || index} className="bg-gray-50 p-4 rounded-lg shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-800">{record.institution}</h3>
                    <p className="text-gray-600">{record.details}</p>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Professional Qualifications Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
            <h2 className="text-xl font-bold text-gray-800">Professional Qualifications</h2>
            <button
              onClick={() => {
                setShowProfessionalForm(!showProfessionalForm);
                setShowAcademicForm(false);
                setApiError(null);
                setSuccessMessage(null);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition w-full sm:w-auto"
            >
              {showProfessionalForm ? 'Cancel' : 'Add Professional Qualification'}
            </button>
          </div>

          {showProfessionalForm && (
            <div className="mb-6 space-y-3">
              <input
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Title"
                value={professionalInput.title}
                onChange={(e) => setProfessionalInput({ ...professionalInput, title: e.target.value })}
              />
              <input
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Organization"
                value={professionalInput.organization}
                onChange={(e) => setProfessionalInput({ ...professionalInput, organization: e.target.value })}
              />
              <input
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Duration"
                value={professionalInput.duration}
                onChange={(e) => setProfessionalInput({ ...professionalInput, duration: e.target.value })}
              />
              <input
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Description (optional)"
                value={professionalInput.description}
                onChange={(e) => setProfessionalInput({ ...professionalInput, description: e.target.value })}
              />
              <button
                onClick={handleAddProfessional}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition w-full sm:w-auto"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          )}

          {(!employee?.professionalQualifications || employee.professionalQualifications.length === 0) ? (
            <p className="text-center text-gray-500 py-4">No professional qualifications added yet.</p>
          ) : (
            <div className="space-y-4">
              {employee.professionalQualifications.map((qualification, index) => (
                <div key={qualification._id || index} className="bg-gray-50 p-4 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-800">{qualification.title}</h3>
                  {qualification.organization && <p className="text-gray-600">{qualification.organization}</p>}
                  <p className="text-gray-600">{qualification.duration}</p>
                  {qualification.description && <p className="text-gray-600">{qualification.description}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EducationQualifications;