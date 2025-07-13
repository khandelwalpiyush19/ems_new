import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  fetchEmployeeDetails,
  fetchEmployeeOwnInfo,
  clearEmployeeDetails
} from '../../context/employeeDetailsSlice';

const EmployeeProfile = ({ employeeId }) => {
  const dispatch = useDispatch();
  const {
    employee,
    loading,
    error,
    updatingStatus,
    statusUpdateError,
    updatingInfo,
    addingRecord,
    addingGuarantor,
    addingQualification,
    addingNextOfKin,
    addingFamilyDetail,
    updatingFinancialDetails
  } = useSelector((state) => state.employeeDetails);

  const isOwnProfile = !employeeId;

  useEffect(() => {
    if (employeeId) {
      dispatch(fetchEmployeeDetails(employeeId));
    } else {
      dispatch(fetchEmployeeOwnInfo());
    }

    return () => {
      dispatch(clearEmployeeDetails());
    };
  }, [dispatch, employeeId]);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading employee data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-red-500">
          <p className="text-lg font-medium">Error loading employee data</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No employee data found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:ml-64">
      {/* Mobile top padding to account for navbar */}
      <div className="pt-16 md:pt-0">
        <div className="max-w-5xl mx-auto">
          {/* Profile Header */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className=" bg-gray-800 px-4 sm:px-6 py-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="mb-4 sm:mb-0">
                  <h1 className="text-xl sm:text-2xl font-bold text-white">
                    {employee.name} {employee.lastName}
                  </h1>
                  <p className="text-blue-100">
                    {employee.jobTitle} • {employee.department}
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-blue-100">Employee ID: {employee.employeeId || 'EMP2023'}</p>
                  <p className="text-blue-100">{employee.position} Position</p>
                  {employee.active !== undefined && (
                    <p className={`text-xs font-medium px-2 py-1 rounded-full inline-block mt-1 ${
                      employee.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {employee.active ? 'Active' : 'Inactive'}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="px-4 sm:px-6 py-4">
              {/* Personal Information */}
              <Section title="Personal Information">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoField label="Email" value={employee.email} />
                  <InfoField label="Personal Email" value={employee.personalEmail} />
                  <InfoField label="Primary Phone" value={employee.phone1} />
                  <InfoField label="Secondary Phone" value={employee.phone2} />
                  <InfoField label="Address" value={employee.address} spanFull />
                </div>
              </Section>

              {/* Financial Information */}
              {employee.financialDetails && (
                <Section title="Financial Information">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoField label="Bank Name" value={employee.financialDetails.bankName} />
                    <InfoField label="Account Name" value={employee.financialDetails.accountName} />
                    <InfoField label="Account Number" value={employee.financialDetails.accountNo} />
                    <InfoField label="IFSC Code" value={employee.financialDetails.ifsc} />
                  </div>
                </Section>
              )}

              {/* Academic Records */}
              {employee.academicRecords && employee.academicRecords.length > 0 && (
                <Section title="Education">
                  {employee.academicRecords.map((record, index) => (
                    <div key={index} className="mb-4 last:mb-0">
                      <h3 className="font-semibold text-gray-800">{record.institution}</h3>
                      <p className="text-gray-600">{record.details}</p>
                    </div>
                  ))}
                </Section>
              )}

              {/* Professional Qualifications */}
              {employee.professionalQualifications && employee.professionalQualifications.length > 0 && (
                <Section title="Certifications">
                  {employee.professionalQualifications.map((qualification, index) => (
                    <div key={index} className="mb-4 last:mb-0">
                      <h3 className="font-semibold text-gray-800">{qualification.title}</h3>
                      <p className="text-gray-600">{qualification.organization} • {qualification.duration}</p>
                      <p className="text-gray-500 text-sm">{qualification.description}</p>
                    </div>
                  ))}
                </Section>
              )}

              {/* Family Details */}
              {employee.familyDetails && employee.familyDetails.length > 0 && (
                <Section title="Family Members">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {employee.familyDetails.map((member, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <h3 className="font-semibold text-gray-800">{member.fullName}</h3>
                        <p className="text-gray-600 capitalize">{member.relationship}</p>
                        <p className="text-gray-600">{member.occupation}</p>
                        <p className="text-gray-500 text-sm mt-2">{member.phoneNo}</p>
                        <p className="text-gray-500 text-sm">{member.address}</p>
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {/* Next of Kin */}
              {employee.nextOfKins && employee.nextOfKins.length > 0 && (
                <Section title="Next of Kin">
                  {employee.nextOfKins.map((kin, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <h3 className="font-semibold text-gray-800">{kin.name}</h3>
                      <p className="text-gray-600 capitalize">{kin.relationship}</p>
                      <p className="text-gray-600">{kin.occupation}</p>
                      <p className="text-gray-500 text-sm mt-2">{kin.phoneNumber}</p>
                      <p className="text-gray-500 text-sm">{kin.address}</p>
                    </div>
                  ))}
                </Section>
              )}

              {/* Guarantors */}
              {employee.guarantors && employee.guarantors.length > 0 && (
                <Section title="Guarantors">
                  {employee.guarantors.map((guarantor, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <h3 className="font-semibold text-gray-800">{guarantor.name}</h3>
                      <p className="text-gray-600 capitalize">{guarantor.relationship}</p>
                      <p className="text-gray-600">{guarantor.occupation}</p>
                      <p className="text-gray-500 text-sm">{guarantor.address}</p>
                    </div>
                  ))}
                </Section>
              )}

              {/* Documents */}
              {employee.documents && employee.documents.length > 0 && (
                <Section title="Documents">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {employee.documents.map((doc, index) => (
                      <div key={index} className="border rounded-lg p-4 flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-800 capitalize">{doc.documentType}</h3>
                          <p className="text-gray-500 text-sm">{doc.fileName}</p>
                          <p className="text-gray-400 text-xs mt-1">Uploaded: {formatDate(doc.uploadedAt)}</p>
                        </div>
                        <button className="bg-blue-50 text-blue-600 px-3 py-1 rounded-md text-sm hover:bg-blue-100">
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                </Section>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Section = ({ title, children }) => (
  <div className="mb-8 last:mb-0">
    <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">{title}</h2>
    {children}
  </div>
);

const InfoField = ({ label, value, spanFull = false }) => (
  <div className={spanFull ? "col-span-1 md:col-span-2" : ""}>
    <p className="text-sm font-medium text-gray-500">{label}</p>
    <p className="text-gray-800 break-words">{value || "-"}</p>
  </div>
);

export default EmployeeProfile;