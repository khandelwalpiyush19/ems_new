import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEmployeeOwnInfo, addGuarantor } from '../../context/employeeDetailsSlice';

const GuarantorDetails = () => {
  const dispatch = useDispatch();
  const {
    employee,
    loading,
    error: reduxError,
    addingGuarantor
  } = useSelector(state => state.employeeDetails);

  const [formData, setFormData] = useState({
    name: '',
    occupation: '',
    phoneNumber: '',  // Changed from 'phone' to 'phoneNumber'
    relationship: 'Relative',
    address: '',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [localError, setLocalError] = useState(null);

  useEffect(() => {
    dispatch(fetchEmployeeOwnInfo());
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);

    // Validate required fields
    if (!formData.name || !formData.occupation || !formData.phoneNumber) {
      setLocalError('Name, occupation and phone number are required');
      return;
    }

    // Phone number validation
    if (!/^\d{10,15}$/.test(formData.phoneNumber)) {
      setLocalError('Phone number must be 10-15 digits');
      return;
    }

    try {
      const result = await dispatch(addGuarantor({
        name: formData.name,
        occupation: formData.occupation,
        phoneNumber: formData.phoneNumber,
        relationship: formData.relationship,
        address: formData.address
      }));

      if (addGuarantor.fulfilled.match(result)) {
        setIsEditing(false);
        dispatch(fetchEmployeeOwnInfo());
      } else {
        throw new Error(result.payload || 'Failed to save guarantor details');
      }
    } catch (error) {
      setLocalError(error.message.replace('phone', 'phone number'));
    }
  };

  return (
    <div className="lg:ml-64 xl:ml-64 md:ml-64 sm:ml-0 p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white p-4 md:p-6 rounded-lg shadow">
        <h2 className="text-xl md:text-2xl font-semibold mb-4 text-gray-800">Guarantor Details</h2>

        {(reduxError || localError) && (
          <div className="mb-4 p-2 text-red-600 bg-red-100 rounded">
            {reduxError || localError}
          </div>
        )}

        {!isEditing ? (
          <div className="space-y-6">
            {employee?.guarantors?.length > 0 ? (
              employee.guarantors.map((guarantor, index) => (
                <div key={guarantor._id || index} className="border-b pb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <p><strong>Name:</strong> {guarantor.name}</p>
                    <p><strong>Occupation:</strong> {guarantor.occupation}</p>
                    <p><strong>Phone:</strong> {guarantor.phoneNumber}</p>
                    <p><strong>Relationship:</strong> {guarantor.relationship}</p>
                    <p className="md:col-span-2"><strong>Address:</strong> {guarantor.address.split('\n').map((line, i) => (
                      <span key={i}>{line}<br /></span>
                    ))}</p>
                  </div>
                  <button
                    onClick={() => {
                      setFormData({
                        name: guarantor.name,
                        occupation: guarantor.occupation,
                        phoneNumber: guarantor.phoneNumber,
                        relationship: guarantor.relationship,
                        address: guarantor.address
                      });
                      setIsEditing(true);
                    }}
                    className="mt-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
                  >
                    Edit
                  </button>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No guarantor details available</p>
            )}

            <button
              onClick={() => setIsEditing(true)}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full md:w-auto"
            >
              Add New Guarantor
            </button>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <h3 className="text-lg font-medium">
              {isEditing ? 'Edit Guarantor' : 'Add New Guarantor'}
            </h3>

            <div>
              <label className="block font-medium text-gray-700 mb-1">Name*</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">Occupation*</label>
              <input
                type="text"
                name="occupation"
                value={formData.occupation}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">Phone Number*</label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">Relationship*</label>
              <select
                name="relationship"
                value={formData.relationship}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              >
                <option value="Relative">Relative</option>
                <option value="Friend">Friend</option>
                <option value="Colleague">Colleague</option>
                <option value="Spouse">Spouse</option>
                <option value="Parent">Parent</option>
                <option value="Sibling">Sibling</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">Address*</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 h-24 resize-none"
                required
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded disabled:bg-green-400 flex-1"
                disabled={addingGuarantor || !formData.name || !formData.occupation || !formData.phoneNumber}
              >
                {addingGuarantor ? 'Saving...' : 'Save'}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded flex-1"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default GuarantorDetails;