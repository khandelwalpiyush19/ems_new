import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateFinancialDetails } from '../../context/employeeDetailsSlice';
import { toast } from 'react-toastify';

const FinancialDetails = () => {
  const dispatch = useDispatch();
  const { employee, updatingFinancialDetails } = useSelector((state) => state.employeeDetails);
  
  const [formData, setFormData] = useState({
    bankName: '',
    ifsc: '',
    accountNo: '',
    accountName: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (employee?.financialDetails) {
      setFormData({
        bankName: employee.financialDetails.bankName || '',
        ifsc: employee.financialDetails.ifsc || '',
        accountNo: employee.financialDetails.accountNo || '',
        accountName: employee.financialDetails.accountName || '',
      });
      setLoading(false);
    }
  }, [employee]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.bankName || !formData.ifsc || !formData.accountNo || !formData.accountName) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await dispatch(updateFinancialDetails(formData)).unwrap();
      toast.success('Financial details updated successfully!');
      setIsEditing(false);
    } catch (error) {
      toast.error(error || 'Failed to update financial details');
    }
  };

  return (
    <div className="bg-blue-50 p-8 rounded-2xl ml-84 max-w-2xl mx-auto mt-10 shadow-md">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Financial Details</h2>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-5">
          {[
            { label: 'Bank Name', name: 'bankName', required: true },
            { label: 'IFSC Code', name: 'ifsc', required: true },
            { label: 'Account Number', name: 'accountNo', required: true },
            { label: 'Account Holder Name', name: 'accountName', required: true },
          ].map(({ label, name, required }) => (
            <div key={name} className="flex flex-col gap-1">
              <label htmlFor={name} className="text-sm text-gray-700 font-medium">
                {label} {required && <span className="text-red-500">*</span>}
              </label>
              <input
                type="text"
                name={name}
                id={name}
                value={formData[name]}
                onChange={handleChange}
                required={required}
                className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                placeholder={label}
              />
            </div>
          ))}

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={updatingFinancialDetails}
              className={`${
                updatingFinancialDetails 
                  ? 'bg-green-400 cursor-not-allowed' 
                  : 'bg-green-500 hover:bg-green-600'
              } text-white px-6 py-2 rounded-lg font-medium transition`}
            >
              {updatingFinancialDetails ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="bg-gray-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-600 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-white p-6 rounded-xl shadow-lg max-w-md mx-auto">
          <h3 className="text-lg font-semibold mb-4">Bank Information</h3>
          <p className="mb-2">
            <strong>Bank Name:</strong> {formData.bankName || 'N/A'}
          </p>
          <p className="mb-2">
            <strong>IFSC:</strong> {formData.ifsc || 'N/A'}
          </p>
          <p className="mb-2">
            <strong>Account No:</strong> {formData.accountNo ? '••••••••' + formData.accountNo.slice(-4) : 'N/A'}
          </p>
          <p className="mb-4">
            <strong>Account Name:</strong> {formData.accountName || 'N/A'}
          </p>
          <button
            onClick={() => setIsEditing(true)}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          >
            Edit
          </button>
        </div>
      )}
    </div>
  );
};

export default FinancialDetails;