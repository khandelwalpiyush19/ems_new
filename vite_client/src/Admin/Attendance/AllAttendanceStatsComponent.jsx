import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchAllAttendanceStats, 
  fetchEmployeeList, 
  fetchEmployeeAttendanceDetails,
  clearEmployeeDetails
} from '../../context/attendanceSlice';

const AllAttendanceStatsComponent = () => {
  const dispatch = useDispatch();
  const { 
    employeeList, 
    employeeDetails, 
    employeeStats,
    loading, 
    error 
  } = useSelector((state) => state.attendance);
  
  const [timeRange, setTimeRange] = useState('monthly');
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showEmployeeDetails, setShowEmployeeDetails] = useState(false);
  const [departmentFilter, setDepartmentFilter] = useState('');

  useEffect(() => {
    const params = { range: timeRange };
    if (timeRange === 'monthly') params.year = year;
    if (timeRange === 'daily') {
      params.year = year;
      params.month = month;
    }
    dispatch(fetchAllAttendanceStats(params));
    dispatch(fetchEmployeeList({ department: departmentFilter }));
  }, [dispatch, timeRange, year, month, departmentFilter]);

  const handleTimeRangeChange = (e) => {
    setTimeRange(e.target.value);
  };

  const handleEmployeeSelect = (employeeId) => {
    setSelectedEmployee(employeeId);
    setShowEmployeeDetails(true);
    dispatch(fetchEmployeeAttendanceDetails({ 
      employeeId,
      params: { 
        startDate: `${year}-01-01`,
        endDate: `${year}-12-31`
      }
    }));
  };

  const handleBackToList = () => {
    setShowEmployeeDetails(false);
    setSelectedEmployee(null);
    dispatch(clearEmployeeDetails());
  };

  if (loading) return <div className="text-center py-8">Loading statistics...</div>;
  if (error) return <div className="text-red-500 text-center py-8">Error: {error.message}</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Main Content - responsive to sidebar state */}
      <div className="transition-all duration-300 ease-in-out lg:ml-64 lg:pl-8 p-4 lg:p-8">
        {!showEmployeeDetails ? (
          <>
            <h2 className="text-xl lg:text-2xl font-bold mb-6 text-gray-800">Employee Attendance</h2>
            
            <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-4 mb-6">
              <div className="flex items-center gap-2">
                <label htmlFor="timeRange" className="text-sm font-medium text-gray-700">Time Range:</label>
                <select
                  id="timeRange"
                  value={timeRange}
                  onChange={handleTimeRangeChange}
                  className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm lg:text-base"
                >
                  <option value="daily">Daily</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              {timeRange !== 'yearly' && (
                <div className="flex items-center gap-2">
                  <label htmlFor="year" className="text-sm font-medium text-gray-700">Year:</label>
                  <select
                    id="year"
                    value={year}
                    onChange={(e) => setYear(parseInt(e.target.value))}
                    className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm lg:text-base"
                  >
                    {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              )}

              {timeRange === 'daily' && (
                <div className="flex items-center gap-2">
                  <label htmlFor="month" className="text-sm font-medium text-gray-700">Month:</label>
                  <select
                    id="month"
                    value={month}
                    onChange={(e) => setMonth(parseInt(e.target.value))}
                    className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm lg:text-base"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                      <option key={m} value={m}>{new Date(2000, m - 1, 1).toLocaleString('default', { month: 'short' })}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex items-center gap-2">
                <label htmlFor="department" className="text-sm font-medium text-gray-700">Department:</label>
                <select
                  id="department"
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm lg:text-base"
                >
                  <option value="">All</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Sales">Sales</option>
                  <option value="HR">HR</option>
                  <option value="Finance">Finance</option>
                </select>
              </div>
            </div>

            <div className="bg-white p-4 lg:p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">Employee List</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 lg:px-6 lg:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-3 py-2 lg:px-6 lg:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                      <th className="px-3 py-2 lg:px-6 lg:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                      <th className="px-3 py-2 lg:px-6 lg:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-3 py-2 lg:px-6 lg:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {employeeList.map((employee) => (
                      <tr key={employee._id}>
                        <td className="px-3 py-2 lg:px-6 lg:py-4 whitespace-nowrap text-sm">{employee.name}</td>
                        <td className="px-3 py-2 lg:px-6 lg:py-4 whitespace-nowrap text-sm">{employee.department}</td>
                        <td className="px-3 py-2 lg:px-6 lg:py-4 whitespace-nowrap text-sm">{employee.position}</td>
                        <td className="px-3 py-2 lg:px-6 lg:py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${employee.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {employee.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-3 py-2 lg:px-6 lg:py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleEmployeeSelect(employee._id)}
                            className="text-blue-600 hover:text-blue-900 text-sm lg:text-base"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div>
            <button 
              onClick={handleBackToList}
              className="mb-4 flex items-center text-blue-600 hover:text-blue-800 text-sm lg:text-base"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Employee List
            </button>

            <div className="bg-white p-4 lg:p-6 rounded-lg shadow-md mb-6">
              <h2 className="text-xl lg:text-2xl font-bold mb-2 text-gray-800">
                {employeeDetails?.name} ({employeeDetails?.employeeId})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-500">Department</p>
                  <p className="font-medium text-sm lg:text-base">{employeeDetails?.department}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Position</p>
                  <p className="font-medium text-sm lg:text-base">{employeeDetails?.position}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-sm lg:text-base">{employeeDetails?.email}</p>
                </div>
              </div>

              <div className="bg-gray-50 p-3 lg:p-4 rounded-lg mb-6">
                <h3 className="text-base lg:text-lg font-semibold mb-4">Attendance Summary ({employeeStats?.period?.start?.substring(0, 4)} - {employeeStats?.period?.end?.substring(0, 4)})</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="bg-white p-2 lg:p-3 rounded shadow">
                    <p className="text-xs lg:text-sm text-gray-500">Working Days</p>
                    <p className="text-lg lg:text-xl font-bold">{employeeStats?.period?.workingDays}</p>
                  </div>
                  <div className="bg-white p-2 lg:p-3 rounded shadow">
                    <p className="text-xs lg:text-sm text-gray-500">Present Days</p>
                    <p className="text-lg lg:text-xl font-bold">{employeeStats?.statistics?.presentDays}</p>
                  </div>
                  <div className="bg-white p-2 lg:p-3 rounded shadow">
                    <p className="text-xs lg:text-sm text-gray-500">Half Days</p>
                    <p className="text-lg lg:text-xl font-bold">{employeeStats?.statistics?.halfDays}</p>
                  </div>
                  <div className="bg-white p-2 lg:p-3 rounded shadow">
                    <p className="text-xs lg:text-sm text-gray-500">Absent Days</p>
                    <p className="text-lg lg:text-xl font-bold">{employeeStats?.statistics?.absentDays}</p>
                  </div>
                  <div className="bg-white p-2 lg:p-3 rounded shadow">
                    <p className="text-xs lg:text-sm text-gray-500">Attendance Rate</p>
                    <p className="text-lg lg:text-xl font-bold">
                      {(employeeStats?.statistics?.attendanceRate * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div className="bg-white p-2 lg:p-3 rounded shadow">
                    <p className="text-xs lg:text-sm text-gray-500">Total Overtime</p>
                    <p className="text-lg lg:text-xl font-bold">{employeeStats?.statistics?.totalOvertime} hours</p>
                  </div>
                </div>
              </div>

              <h3 className="text-base lg:text-lg font-semibold mb-4">Recent Attendance Records</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 lg:px-6 lg:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-3 py-2 lg:px-6 lg:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-3 py-2 lg:px-6 lg:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clock In</th>
                      <th className="px-3 py-2 lg:px-6 lg:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clock Out</th>
                      <th className="px-3 py-2 lg:px-6 lg:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
                      <th className="px-3 py-2 lg:px-6 lg:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Overtime</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {employeeStats?.recentRecords?.map((record, index) => (
                      <tr key={index}>
                        <td className="px-3 py-2 lg:px-6 lg:py-4 whitespace-nowrap text-sm">
                          {new Date(record.date).toLocaleDateString()}
                        </td>
                        <td className="px-3 py-2 lg:px-6 lg:py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${record.status === 'present' ? 'bg-green-100 text-green-800' :
                              record.status === 'half-day' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'}`}>
                            {record.status}
                          </span>
                        </td>
                        <td className="px-3 py-2 lg:px-6 lg:py-4 whitespace-nowrap text-sm">
                          {record.clockIn ? new Date(record.clockIn).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--'}
                        </td>
                        <td className="px-3 py-2 lg:px-6 lg:py-4 whitespace-nowrap text-sm">
                          {record.clockOut ? new Date(record.clockOut).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--'}
                        </td>
                        <td className="px-3 py-2 lg:px-6 lg:py-4 whitespace-nowrap text-sm">
                          {record.effectiveHours?.toFixed(2) || '--'}h
                        </td>
                        <td className="px-3 py-2 lg:px-6 lg:py-4 whitespace-nowrap text-sm">
                          {record.overtimeHours?.toFixed(2) || '0'}h
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllAttendanceStatsComponent;