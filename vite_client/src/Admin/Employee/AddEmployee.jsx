import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { createEmployee } from '../../context/employeeSlice';

function AddEmployee() {
    const [form, setForm] = useState({
        name: '',
        lastName: '',
        department: '',
        manager: '',
        jobTitle: '',
        jobCategory: '',
        email: '',
        password: '',
        position: '',
        salary: '',
    });

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const employeeStatus = useSelector(state => state.employees.status);
    const employeeError = useSelector(state => state.employees.error);

    const departments = [
        "Engineering", "HR", "Finance", "Sales", "Marketing", "IT Support", "Operations",
        "Customer Support", "Legal", "Product", "Research & Development", "Design", "Administration"
    ];

    const jobTitles = [
        "Software Engineer", "Frontend Developer", "Backend Developer", "DevOps Engineer", "HR Manager",
        "Financial Analyst", "Marketing Executive", "Sales Representative", "Product Manager",
        "QA Tester", "Customer Support Specialist", "UX/UI Designer", "Project Manager",
        "Legal Advisor", "Operations Coordinator", "Full Stack Developer"
    ];

    const jobCategories = [
        "Information Technology", "Human Resources", "Finance", "Marketing", "Sales", "Operations",
        "Customer Service", "Research and Development", "Engineering", "Legal", "Administration",
        "Management", "Design", "Product Management"
    ];

    const positions = [
        "Intern", "Junior", "Mid-Level", "Senior", "Lead", "Supervisor", "Manager",
        "Director", "VP", "CTO", "CFO", "CEO"
    ];

    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setError('');

        const resultAction = await dispatch(createEmployee(form));

        if (createEmployee.fulfilled.match(resultAction)) {
            navigate('/dashboard-admin');
        } else {
            setError(resultAction.payload || 'Failed to create employee');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Main Content - responsive to sidebar state */}
            <div className="transition-all duration-300 ease-in-out lg:ml-64 lg:pl-8 p-4 lg:p-8">
                {/* Mobile header would go here if needed */}
                
                <div className="bg-white rounded-lg shadow-md p-4 lg:p-8">
                    <h1 className="text-xl lg:text-2xl font-semibold text-gray-800 mb-6">➕ Add Employee</h1>
                    
                    {(error || employeeError) && (
                        <p className="text-red-500 mb-4">{error || employeeError}</p>
                    )}
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="flex flex-col lg:flex-row gap-4">
                            <input
                                className="flex-1 px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                                name="name"
                                placeholder="Name"
                                onChange={handleChange}
                                required
                            />
                            <input
                                className="flex-1 px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                                name="lastName"
                                placeholder="Last Name"
                                onChange={handleChange}
                                required
                            />
                        </div>
                        
                        <div className="flex flex-col lg:flex-row gap-4">
                            <select
                                className="flex-1 px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                                name="department"
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select Department</option>
                                {departments.map(dep => <option key={dep} value={dep}>{dep}</option>)}
                            </select>
                            <input
                                className="flex-1 px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                                name="manager"
                                placeholder="Manager"
                                onChange={handleChange}
                                required
                            />
                        </div>
                        
                        <div className="flex flex-col lg:flex-row gap-4">
                            <select
                                className="flex-1 px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                                name="jobTitle"
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select Job Title</option>
                                {jobTitles.map(title => <option key={title} value={title}>{title}</option>)}
                            </select>
                            <select
                                className="flex-1 px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                                name="jobCategory"
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select Job Category</option>
                                {jobCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                        
                        <div className="flex flex-col lg:flex-row gap-4">
                            <input
                                className="flex-1 px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                                name="email"
                                placeholder="E-Mail"
                                type="email"
                                onChange={handleChange}
                                required
                            />
                            <input
                                className="flex-1 px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                                name="password"
                                placeholder="Password"
                                type="password"
                                onChange={handleChange}
                                required
                            />
                        </div>
                        
                        <div className="flex flex-col lg:flex-row gap-4">
                            <select
                                className="flex-1 px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                                name="position"
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select Position</option>
                                {positions.map(pos => <option key={pos} value={pos}>{pos}</option>)}
                            </select>
                            <input
                                className="flex-1 px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                                name="salary"
                                placeholder="Salary"
                                type="number"
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={employeeStatus === 'loading'}
                            className="w-full lg:w-auto px-6 py-3 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                        >
                            {employeeStatus === 'loading' ? 'Adding...' : 'Add Employee'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default AddEmployee;