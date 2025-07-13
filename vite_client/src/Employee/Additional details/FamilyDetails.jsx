import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addFamilyDetail } from '../../context/employeeDetailsSlice';
import { toast } from 'react-toastify';

const FamilyDetails = () => {
  const dispatch = useDispatch();
  const { employee, addingFamilyDetail } = useSelector((state) => state.employeeDetails);

  // Initial form state
  const initialFormData = {
    fullName: '',
    relationship: '',
    phoneNo: '',
    address: '',
    occupation: '',
  };

  const [formData, setFormData] = useState(initialFormData);
  const [isEditing, setIsEditing] = useState(false);

  const familyDetails = employee?.familyDetails || [];

  useEffect(() => {
    if (familyDetails.length > 0 && !isEditing) {
      const [detail] = familyDetails;
      setFormData({
        fullName: detail.fullName || '',
        relationship: detail.relationship || '',
        phoneNo: detail.phoneNo || '',
        address: detail.address || '',
        occupation: detail.occupation || '',
      });
    }
  }, [employee, isEditing]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(addFamilyDetail(formData)).unwrap();
      toast.success('Family detail added successfully!');
      setFormData(initialFormData); // Clear the form
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating family details:', error);
     toast.success('Family detail added successfully!');
     setFormData(initialFormData); // Clear the form
      setIsEditing(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow-md border border-gray-200 mt-8">
      <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">Family Details</h2>

      {!isEditing && familyDetails.length > 0 ? (
  <div className="space-y-4">
    {familyDetails.map((member, index) => (
      <div
        key={member._id || index}
        className="bg-gray-100 p-5 rounded-lg shadow-sm border border-gray-300"
      >
        <p className="mb-2"><strong>Name:</strong> {member.fullName || 'N/A'}</p>
        <p className="mb-2"><strong>Occupation:</strong> {member.occupation || 'N/A'}</p>
        <p className="mb-2"><strong>Phone:</strong> {member.phoneNo || 'N/A'}</p>
        <p className="mb-2"><strong>Relationship:</strong> {member.relationship || 'N/A'}</p>
        <p className="mb-4"><strong>Address:</strong> {member.address || 'N/A'}</p>
      </div>
    ))}

    <button
      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
      onClick={() => {
  setFormData(initialFormData);  // clear form
  setIsEditing(true);
}}

    >
      Add More
    </button>
  </div>

      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {['fullName', 'occupation', 'relationship', 'phoneNo', 'address'].map((field) => (
            <div key={field} className="flex flex-col">
              <label htmlFor={field} className="font-medium text-gray-700 capitalize">
                {field === 'phoneNo' ? 'Phone Number' : field.replace(/([A-Z])/g, ' $1')}
              </label>
              <input
                type="text"
                name={field}
                id={field}
                value={formData[field]}
                onChange={handleChange}
                required={['fullName', 'relationship', 'phoneNo', 'address'].includes(field)}
                className="mt-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          ))}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={addingFamilyDetail}
              className={`${
                addingFamilyDetail ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
              } text-white px-4 py-2 rounded transition`}
            >
              {addingFamilyDetail ? 'Saving...' : 'Save Family Details'}
            </button>
            {familyDetails.length > 0 && (
              <button
                type="button"
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition"
                onClick={() => {
                  setIsEditing(false);
                  // Reset to existing values when canceling
                  const [detail] = familyDetails;
                  setFormData({
                    fullName: detail.fullName || '',
                    relationship: detail.relationship || '',
                    phoneNo: detail.phoneNo || '',
                    address: detail.address || '',
                    occupation: detail.occupation || '',
                  });
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
};

export default FamilyDetails;