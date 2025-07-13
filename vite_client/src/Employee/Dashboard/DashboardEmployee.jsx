import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Todo from './Todo';
import AttendanceBox from '../Attendance/AttendanceBox';
import NotificationFeed from './NotificationFeed';
import PasswordResetPopup from '../PasswordResetPopup';
import { fetchEmployeeOwnInfo } from '../../context/employeeDetailsSlice';

function DashboardEmployee() {
    const [employee, setEmployee] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [checkInTime, setCheckInTime] = useState(null);
    const [timer, setTimer] = useState(null);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [showResetPopup, setShowResetPopup] = useState(false);

    const navigate = useNavigate();
    const user = useSelector((state) => state.auth.user);
    const dispatch = useDispatch();

    const handleEditProfile = () => navigate('/profile-details');
    const handleViewReport = () => navigate('/attendance');

    const handleCheckIn = async () => {
        const now = new Date();
        setCheckInTime(now);
        setElapsedTime(0);
        setTimer(setInterval(() => setElapsedTime(prev => prev + 1), 1000));

        try {
            const token = localStorage.getItem('token');
            await fetch('/api/check-in', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ checkInTime: now }),
            });
        } catch (err) {
            console.error('Failed to save check-in time:', err);
        }
    };

    useEffect(() => {
        dispatch(fetchEmployeeOwnInfo());
    }, [dispatch]);

    const handleCheckOut = async () => {
        const now = new Date();
        clearInterval(timer);
        setTimer(null);

        try {
            const token = localStorage.getItem('token');
            await fetch('/api/check-out', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ checkOutTime: now, totalWorkingTime: elapsedTime }),
            });
        } catch (err) {
            console.error('Failed to save check-out time:', err);
        }
    };

    const formatTime = (seconds) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        if (user?.mustResetPassword) {
            setShowResetPopup(true);
        }
    }, [user]);

    return (
        <div className="min-h-screen bg-gray-100 p-5 ml-64 transition-all duration-300">
            {/* For desktop: ml-64 for default open sidebar */}
            {/* For mobile: ml-0 and full width (handled via responsive design) */}
            
            {showResetPopup && <PasswordResetPopup onClose={() => setShowResetPopup(false)} />}
            
            {/* Header Card */}
            <div className="bg-emerald-200 rounded-xl p-5 mb-6 flex flex-col md:flex-row justify-between items-center">
                <div className="flex items-center space-x-4 mb-4 md:mb-0">
                    <img 
                        src="/Avatar.jpg" 
                        alt="Profile" 
                        className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover"
                    />
                    <div>
                        <h2 className="text-lg md:text-xl font-bold text-gray-800">{user?.name || 'User'}</h2>
                        <p className="text-sm md:text-base text-gray-600">{user?.jobTitle || 'Employee'}</p>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <button 
                        onClick={handleEditProfile}
                        className="bg-gray-800 text-white px-3 py-1 md:px-4 md:py-2 rounded-lg font-medium hover:bg-gray-700 transition text-sm md:text-base"
                    >
                        Edit Profile
                    </button>
                    <Link to="/view-profile" className="w-full sm:w-auto">
                        <button 
                            className="w-full bg-gray-800 text-white px-3 py-1 md:px-4 md:py-2 rounded-lg font-medium hover:bg-gray-700 transition text-sm md:text-base"
                        >
                            View Profile
                        </button>
                    </Link>
                </div>
            </div>

            {/* Check In/Out Section */}
            <AttendanceBox/>

            {/* Main Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <NotificationFeed/>

                {/* Payslip Card */}
                <div className="bg-white rounded-xl p-4 md:p-5 border-2 border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">April Pay slip breakdown</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-max">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="p-2 text-left text-sm">Earnings</th>
                                    <th className="p-2 text-left text-sm">Amount</th>
                                    <th className="p-2 text-left text-sm">Deductions</th>
                                    <th className="p-2 text-left text-sm">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    ['Basic Wage', '150,000', '-30,000', '120,000'],
                                    ['Tax', '15,000', '-3,000', '12,000'],
                                    ['Pension', '15,000', '-3,000', '12,000'],
                                    ['Total Earnings', '150,000', '-36,000', '114,000']
                                ].map((row, index) => (
                                    <tr key={index} className="border-b border-gray-200">
                                        {row.map((cell, cellIndex) => (
                                            <td key={cellIndex} className="p-2 text-sm">{cell}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Birthdays Card */}
                <div className="bg-white rounded-xl p-4 md:p-5 border-2 border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Birthdays</h3>
                    <ul className="space-y-2">
                        {[1, 2, 3].map((item) => (
                            <li key={item} className="bg-gray-50 p-3 rounded-lg flex flex-col sm:flex-row justify-between items-center gap-2">
                                <span className="text-sm md:text-base">Biruk Kidan - April 25th</span>
                                <button className="bg-emerald-400 text-white px-3 py-1 rounded hover:bg-emerald-500 transition text-sm md:text-base">
                                    Send Wishes
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Todos Card */}
                <div className="bg-white rounded-xl p-4 md:p-5 border-2 border-gray-200">
                    <Todo/>
                </div>

                {/* Leave Management Card */}
                <div className="bg-white rounded-xl p-4 md:p-5 border-2 border-gray-200">
                    <div className='flex flex-col md:flex-row justify-between gap-4 mb-4'>
                        <h3 className="text-lg font-semibold text-gray-800">Leave Management</h3>
                        <button 
                            onClick={() => navigate('/my-leave')}
                            className="bg-blue-500 text-white px-3 py-1 md:px-4 md:py-2 rounded hover:bg-blue-600 transition text-sm md:text-base"
                        >
                            View Leaves
                        </button>
                    </div>
                    
                    <div className="flex flex-col space-y-2 md:space-y-4">
                        <button 
                            onClick={() => navigate('/leave')}
                            className="bg-green-500 text-white px-3 py-1 md:px-4 md:py-2 rounded hover:bg-green-600 transition text-sm md:text-base"
                        >
                            Apply for Leave
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DashboardEmployee;