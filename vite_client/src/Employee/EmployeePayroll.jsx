import React, { useState, useEffect } from 'react';
import axios from 'axios';

const EmployeePayroll = () => {
  const [payrollData, setPayrollData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [employeeData, setEmployeeData] = useState(null);

  const currentDate = new Date();
  const currentMonth = currentDate.toLocaleString('default', { month: 'long' });
  const currentYear = currentDate.getFullYear();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please login to view payroll details');
          setLoading(false);
          return;
        }

        const config = {
          headers: { Authorization: `Bearer ${token}` },
        };

        const employeeResponse = await axios.get(
          'http://localhost:5000/api/employees/me',
          config
        );
        setEmployeeData(employeeResponse.data);

        const payrollResponse = await axios.get(
          'http://localhost:5000/api/payroll/employee',
          {
            ...config,
            params: { month: currentMonth, year: currentYear },
          }
        );
        setPayrollData(payrollResponse.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.response?.data?.message || 'Error fetching payroll data');
        setLoading(false);
      }
    };

    fetchData();
  }, [currentMonth, currentYear]);

  if (loading)
    return (
      <div className="max-w-6xl mx-auto p-8">
        <p className="text-gray-700">Loading...</p>
      </div>
    );

  if (error)
    return (
      <div className="max-w-6xl mx-auto p-8">
        <div className="bg-red-100 text-red-700 p-4 rounded">{error}</div>
      </div>
    );

  if (!payrollData || !employeeData)
    return (
      <div className="max-w-6xl mx-auto p-8">
        <div className="bg-blue-100 text-blue-700 p-4 rounded">
          No payroll data available
        </div>
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl shadow mb-8">
        <div className="flex flex-col md:flex-row gap-8 items-center">
          {/* Profile Image */}
          <div className="flex justify-center">
            {employeeData.profileImage ? (
              <img
                src={`http://localhost:5000/${employeeData.profileImage}`}
                alt="Profile"
                className="w-40 h-40 rounded-xl object-cover"
              />
            ) : (
              <div className="w-40 h-40 flex items-center justify-center rounded-xl bg-blue-600 text-white text-4xl font-semibold">
                {employeeData.name?.charAt(0)}
              </div>
            )}
          </div>

          {/* Info Fields */}
          <div className="flex-1 grid gap-4 w-full">
            <div>
              <label className="text-sm text-gray-600 block mb-1">Name</label>
              <input
                readOnly
                value={employeeData.name || ''}
                className="w-full p-3 border rounded bg-gray-50"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 block mb-1">Designation</label>
              <input
                readOnly
                value={employeeData.jobTitle || ''}
                className="w-full p-3 border rounded bg-gray-50"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 block mb-1">Basic Salary</label>
              <input
                readOnly
                value={employeeData.salary || ''}
                className="w-full p-3 border rounded bg-gray-50"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Payslip Section */}
      <div className="bg-white p-6 rounded-xl shadow mb-8">
        <h2 className="text-lg font-semibold mb-4">{currentMonth} Payslip Breakdown</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border rounded overflow-hidden">
            <thead className="bg-gray-100 text-left text-sm text-gray-700">
              <tr>
                <th className="p-4">Earnings</th>
                <th className="p-4 text-right">Amount</th>
                <th className="p-4">Deductions</th>
                <th className="p-4 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-800">
              {['basicWage', 'tax', 'pension'].map((key) => (
                <tr key={key} className="border-b">
                  <td className="p-4 capitalize">{key}</td>
                  <td className="p-4 text-right">{payrollData.earnings?.[key] || 0}</td>
                  <td className="p-4">{payrollData.deductions?.[key] || 0}</td>
                  <td className="p-4 text-right">{payrollData.total?.[key] || 0}</td>
                </tr>
              ))}
              <tr className="bg-gray-200 font-semibold">
                <td className="p-4">Total Earnings</td>
                <td className="p-4 text-right">
                  {payrollData.earnings?.totalEarnings || 0}
                </td>
                <td className="p-4">{payrollData.deductions?.total || 0}</td>
                <td className="p-4 text-right">{payrollData.total?.total || 0}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Leaves Section */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-lg font-semibold mb-4">{currentMonth} Leaves</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border rounded overflow-hidden">
            <thead className="bg-gray-100 text-sm text-gray-700">
              <tr>
                <th className="p-4 text-left">Day Description</th>
                <th className="p-4 text-left">Reason</th>
                <th className="p-4 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-800">
              {payrollData.leaves && payrollData.leaves.length > 0 ? (
                payrollData.leaves.map((leave, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-4">{leave.type}</td>
                    <td className="p-4">{leave.reason}</td>
                    <td className="p-4 text-right">{leave.days}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="p-4 text-center text-gray-500">
                    No leaves taken this month
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmployeePayroll;
