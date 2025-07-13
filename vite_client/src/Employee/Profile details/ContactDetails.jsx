import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateEmployeeInfo } from '../../context/employeeDetailsSlice';

const ContactDetails = () => {
    const dispatch = useDispatch();
    const { employee, updatingInfo } = useSelector((state) => state.employeeDetails);

    const [formData, setFormData] = useState({
        phone1: '',
        phone2: '',
        personalEmail: '',
        address: '',
    });

    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (employee) {
            setFormData({
                phone1: employee.phone1 || '',
                phone2: employee.phone2 || '',
                personalEmail: employee.personalEmail || '',
                address: employee.address || '',
            });
        }
    }, [employee]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { phone1, personalEmail, address } = formData;

        if (!phone1 || !personalEmail || !address) {
            alert('Please fill in all required fields.');
            return;
        }

        try {
            await dispatch(updateEmployeeInfo(formData)).unwrap();
            alert('Contact details updated successfully!');
            setIsEditing(false);
        } catch (err) {
            alert(err?.message || 'Something went wrong.');
        }
    };

    if (!employee) {
        return (
            <div className="flex justify-center items-center p-4 md:p-8 ml-0 md:ml-64 lg:ml-64">
                Loading employee info...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8 ml-0 md:ml-64 lg:ml-64 transition-all duration-300">
            <div className="max-w-xl mx-auto lg:mx-4 lg:ml-32 xl:mx-auto my-5 p-5 bg-white rounded-lg shadow-md font-sans">
                <h2 className="text-xl md:text-2xl mb-5 text-gray-700 font-bold">Contact Details</h2>

                {isEditing ? (
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4 md:gap-5">
                        <div className="flex flex-col sm:flex-row flex-wrap -mx-2">
                            <div className="w-full sm:w-1/2 px-2 mb-4 sm:mb-0">
                                <label className="block mb-2 text-sm font-medium text-gray-700">Phone 1*</label>
                                <input
                                    type="text"
                                    name="phone1"
                                    value={formData.phone1}
                                    onChange={handleChange}
                                    className="w-full p-2 md:p-2.5 border rounded bg-blue-50 text-sm"
                                    required
                                />
                            </div>
                            <div className="w-full sm:w-1/2 px-2">
                                <label className="block mb-2 text-sm font-medium text-gray-700">Phone 2</label>
                                <input
                                    type="text"
                                    name="phone2"
                                    value={formData.phone2}
                                    onChange={handleChange}
                                    className="w-full p-2 md:p-2.5 border rounded bg-blue-50 text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700">Personal Email*</label>
                            <input
                                type="email"
                                name="personalEmail"
                                value={formData.personalEmail}
                                onChange={handleChange}
                                className="w-full p-2 md:p-2.5 border rounded bg-blue-50 text-sm"
                                required
                            />
                        </div>

                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700">Address*</label>
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                className="w-full p-2 md:p-2.5 border rounded bg-blue-50 text-sm resize-none"
                                rows={4}
                                required
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                            <button
                                type="submit"
                                disabled={updatingInfo}
                                className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 sm:px-6 rounded"
                            >
                                {updatingInfo ? 'Saving...' : 'Save'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 sm:px-6 rounded"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                ) : (
                    <>
                        <div className="text-gray-700 space-y-2 text-sm md:text-base">
                            <p><strong>Phone 1:</strong> {formData.phone1 || 'N/A'}</p>
                            <p><strong>Phone 2:</strong> {formData.phone2 || 'N/A'}</p>
                            <p><strong>Personal Email:</strong> {formData.personalEmail || 'N/A'}</p>
                            <p><strong>Address:</strong> {formData.address ? formData.address.split('\n').map((line, i) => (
                                <span key={i}>{line}<br /></span>
                            )) : 'N/A'}</p>
                        </div>
                        <button
                            onClick={() => setIsEditing(true)}
                            className="mt-5 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded w-full sm:w-auto"
                        >
                            Edit
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default ContactDetails;