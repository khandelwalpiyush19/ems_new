import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addNextOfKin, fetchEmployeeOwnInfo } from '../../context/employeeDetailsSlice';

function NextOfKinDetails() {
    const dispatch = useDispatch();
    const { 
        employee, 
        loading, 
        error: reduxError, 
        addingNextOfKin 
    } = useSelector(state => state.employeeDetails);
    
    const [formData, setFormData] = useState({
        name: '',
        occupation: '',
        phone: '',
        relationship: 'Relative',
        address: '',
    });

    const [isEditing, setIsEditing] = useState(false);
    const [localError, setLocalError] = useState(null);
    const [activeKinIndex, setActiveKinIndex] = useState(null);

    useEffect(() => {
        dispatch(fetchEmployeeOwnInfo());
    }, [dispatch]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleEditKin = (kin, index) => {
        setFormData({
            name: kin.name,
            occupation: kin.occupation,
            phone: kin.phone,
            relationship: kin.relationship,
            address: kin.address,
        });
        setActiveKinIndex(index);
        setIsEditing(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError(null);
        
        if (!formData.name || !formData.occupation || !formData.phone) {
            setLocalError('Name, occupation and phone are required');
            return;
        }

        try {
            const result = await dispatch(addNextOfKin(formData));
            
            if (addNextOfKin.fulfilled.match(result)) {
                setIsEditing(false);
                setActiveKinIndex(null);
                dispatch(fetchEmployeeOwnInfo());
            } else {
                throw new Error(result.payload || 'Failed to save next of kin');
            }
        } catch (error) {
            setLocalError(error.message);
        }
    };

    // if (loading) return (
    //     <div className="flex justify-center items-center p-4 md:p-8 ml-0 md:ml-64 lg:ml-64">
    //         <p className="text-gray-500">Loading...</p>
    //     </div>
    // );

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8 ml-0 md:ml-64 lg:ml-64 transition-all duration-300">
            <div className="max-w-2xl mx-auto lg:mx-4 lg:ml-32 xl:mx-auto">
                <div className="bg-white p-4 md:p-6 rounded-lg shadow">
                    <h2 className="text-xl md:text-2xl font-semibold mb-4 text-gray-800">Next of Kin Details</h2>

                    {(reduxError || localError) && (
                        <div className="mb-4 p-2 text-red-600 bg-red-100 rounded text-sm md:text-base">
                            {reduxError || localError}
                        </div>
                    )}

                    {!isEditing ? (
                        <div className="space-y-4 md:space-y-6">
                            {employee?.nextOfKins?.length > 0 ? (
                                employee.nextOfKins.map((kin, index) => (
                                    <div key={kin._id} className="border-b pb-4">
                                        <div className="space-y-1 md:space-y-2 text-sm md:text-base">
                                            <p><strong>Name:</strong> {kin.name}</p>
                                            <p><strong>Occupation:</strong> {kin.occupation}</p>
                                            <p><strong>Phone:</strong> {kin.phone}</p>
                                            <p><strong>Relationship:</strong> {kin.relationship}</p>
                                            <p><strong>Address:</strong> {kin.address.split('\n').map((line, i) => (
                                                <span key={i}>{line}<br /></span>
                                            ))}</p>
                                            <p><strong>Added:</strong> {new Date(kin.addedAt).toLocaleDateString()}</p>
                                        </div>
                                        <button
                                            onClick={() => handleEditKin(kin, index)}
                                            className="mt-2 md:mt-3 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 md:px-4 md:py-2 rounded text-xs md:text-sm"
                                        >
                                            Edit
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500">No next of kin details available</p>
                            )}
                            
                            <button
                                onClick={() => {
                                    setFormData({
                                        name: '',
                                        occupation: '',
                                        phone: '',
                                        relationship: 'Relative',
                                        address: '',
                                    });
                                    setActiveKinIndex(null);
                                    setIsEditing(true);
                                }}
                                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full sm:w-auto"
                            >
                                Add New Next of Kin
                            </button>
                        </div>
                    ) : (
                        <form className="space-y-3 md:space-y-4" onSubmit={handleSubmit}>
                            <h3 className="text-base md:text-lg font-medium">
                                {activeKinIndex !== null ? 'Edit Next of Kin' : 'Add New Next of Kin'}
                            </h3>
                            
                            <div>
                                <label className="block font-medium text-gray-700 mb-1 text-sm md:text-base">Name*</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded px-3 py-1 md:py-2 text-sm md:text-base"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block font-medium text-gray-700 mb-1 text-sm md:text-base">Occupation*</label>
                                <input
                                    type="text"
                                    name="occupation"
                                    value={formData.occupation}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded px-3 py-1 md:py-2 text-sm md:text-base"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block font-medium text-gray-700 mb-1 text-sm md:text-base">Phone Number*</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded px-3 py-1 md:py-2 text-sm md:text-base"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block font-medium text-gray-700 mb-1 text-sm md:text-base">Relationship*</label>
                                <select
                                    name="relationship"
                                    value={formData.relationship}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded px-3 py-1 md:py-2 text-sm md:text-base"
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
                                <label className="block font-medium text-gray-700 mb-1 text-sm md:text-base">Address*</label>
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded px-3 py-1 md:py-2 h-20 md:h-24 resize-none text-sm md:text-base"
                                    required
                                />
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                                <button
                                    type="submit"
                                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded disabled:bg-green-400 text-sm md:text-base"
                                    disabled={addingNextOfKin}
                                >
                                    {addingNextOfKin ? 'Saving...' : 'Save'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsEditing(false);
                                        setActiveKinIndex(null);
                                    }}
                                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm md:text-base"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

export default NextOfKinDetails;