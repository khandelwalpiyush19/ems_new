import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AttendanceDashboard = () => {
    const [attendanceStats, setAttendanceStats] = useState({
        avgHoursPerDay: 0,
        onTimePercentage: 0
    });
    const [attendanceLogs, setAttendanceLogs] = useState([]);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        fetchAttendanceData();
        return () => clearInterval(timer);
    }, []);

    const fetchAttendanceData = async () => {
        try {
            const [statsRes, logsRes] = await Promise.all([
                axios.get('/api/attendance/stats'),
                axios.get('/api/attendance/logs')
            ]);
            setAttendanceStats(statsRes.data);
            setAttendanceLogs(logsRes.data);
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching attendance data:', error);
            setIsLoading(false);
        }
    };

    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            weekday: 'short',
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const handleClockOut = async () => {
        try {
            const todayLog = attendanceLogs.find(log => 
                new Date(log.date).toDateString() === new Date().toDateString()
            );
            if (todayLog && !todayLog.clockOut) {
                await axios.patch(`/api/attendance/clock-out/${todayLog._id}`);
                fetchAttendanceData();
            }
        } catch (error) {
            console.error('Error clocking out:', error);
        }
    };

    const formatDuration = (hours) => {
        const h = Math.floor(hours);
        const m = Math.round((hours - h) * 60);
        return `${h}h ${m}m`;
    };

    if (isLoading) {
        return <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">Loading...</div>;
    }

    return (
        <div className="p-8 bg-gray-900 min-h-screen text-white">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold">Attendance Dashboard</h1>
                <div className="text-right">
                    <div className="text-2xl font-bold">{formatTime(currentTime)}</div>
                    <div className="text-sm text-gray-400 mt-2">{formatDate(currentTime)}</div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-8 mb-8">
                <div className="col-span-2 bg-gray-800 rounded-xl p-6">
                    <h2 className="text-xl font-semibold mb-4">Attendance Stats</h2>
                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <label className="text-sm text-gray-400 block mb-2">AVG HRS / DAY</label>
                            <div className="text-xl font-bold">{formatDuration(attendanceStats.avgHoursPerDay)}</div>
                        </div>
                        <div>
                            <label className="text-sm text-gray-400 block mb-2">ON TIME ARRIVAL</label>
                            <div className="text-xl font-bold">{Math.round(attendanceStats.onTimePercentage)}%</div>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-800 rounded-xl p-6 flex flex-col justify-center items-center gap-4">
                    <button 
                        className="bg-red-400 hover:bg-red-500 text-white py-3 px-8 rounded-lg transition-colors duration-200"
                        onClick={handleClockOut}
                    >
                        Web Clock-out
                    </button>
                    <div className="flex gap-4">
                        <span className="text-blue-400 text-sm flex items-center gap-2 before:content-[''] before:inline-block before:w-2 before:h-2 before:rounded-full before:bg-blue-400">
                            Work From Home
                        </span>
                        <span className="text-blue-400 text-sm flex items-center gap-2 before:content-[''] before:inline-block before:w-2 before:h-2 before:rounded-full before:bg-blue-400">
                            On Duty
                        </span>
                    </div>
                </div>
            </div>

            <div className="bg-gray-800 rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-4">Attendance Log</h2>
                <div className="flex gap-4 mb-8 mt-4">
                    <button className="bg-blue-500 text-white px-4 py-2 rounded text-sm">30 DAYS</button>
                    <button className="text-gray-400 hover:text-white px-4 py-2 rounded text-sm">FEB</button>
                    <button className="text-gray-400 hover:text-white px-4 py-2 rounded text-sm">JAN</button>
                    <button className="text-gray-400 hover:text-white px-4 py-2 rounded text-sm">DEC</button>
                    <button className="text-gray-400 hover:text-white px-4 py-2 rounded text-sm">NOV</button>
                </div>
                <table className="w-full border-collapse">
                    <thead>
                        <tr>
                            <th className="text-left p-4 text-gray-400 font-normal border-b border-gray-700">DATE</th>
                            <th className="text-left p-4 text-gray-400 font-normal border-b border-gray-700">ATTENDANCE VISUAL</th>
                            <th className="text-left p-4 text-gray-400 font-normal border-b border-gray-700">EFFECTIVE HOURS</th>
                            <th className="text-left p-4 text-gray-400 font-normal border-b border-gray-700">GROSS HOURS</th>
                            <th className="text-left p-4 text-gray-400 font-normal border-b border-gray-700">ARRIVAL</th>
                            <th className="text-left p-4 text-gray-400 font-normal border-b border-gray-700">STATUS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {attendanceLogs.map(log => (
                            <tr key={log._id}>
                                <td className="p-4 border-b border-gray-700">{formatDate(new Date(log.date))}</td>
                                <td className="p-4 border-b border-gray-700">
                                    <div className="bg-gray-700 h-2 rounded relative w-full">
                                        <div 
                                            className="absolute h-full bg-blue-400 rounded"
                                            style={{
                                                left: '30%',
                                                width: '40%'
                                            }}
                                        />
                                    </div>
                                </td>
                                <td className="p-4 border-b border-gray-700">{formatDuration(log.effectiveHours)}</td>
                                <td className="p-4 border-b border-gray-700">{formatDuration(log.grossHours)}</td>
                                <td className={`p-4 border-b border-gray-700 ${log.isOnTime ? 'text-green-400' : 'text-red-400'}`}>
                                    {log.isOnTime ? 'On Time' : 'Late'}
                                </td>
                                <td className="p-4 border-b border-gray-700">
                                    <span className={`inline-block w-2 h-2 rounded-full ${
                                        log.status === 'present' ? 'bg-green-400' : 
                                        log.status === 'absent' ? 'bg-red-400' : 
                                        'bg-yellow-400'
                                    }`} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AttendanceDashboard;