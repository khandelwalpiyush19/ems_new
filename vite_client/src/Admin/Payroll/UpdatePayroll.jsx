import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import useUpdatePayroll from '../../Hooks/useUpdatePayroll';

const UpdatePayroll = () => {
  const navigate = useNavigate();
  const { employeeId, month, year } = useParams();
  const { employees, updateEmployeePayroll } = useUpdatePayroll();
  const payrolls = useSelector(state => state.payroll.data);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  const [formData, setFormData] = useState({
    employeeId: '',
    month: 0,
    year: new Date().getFullYear(),
    earnings: {
      basicWage: 0,
      houseRentAllowance: 0,
      overtime: 0,
      gratuity: 0,
      specialAllowance: 0,
      pfEmployer: 0,
      esiEmployer: 0,
    },
    deductions: {
      pfEmployee: 0,
      esiEmployee: 0,
      tax: 0,
      otherDeductions: 0,
    },
    status: 'Pending',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Find payroll data for current employee/month/year from Redux store
  useEffect(() => {
    if (employeeId && month && year && payrolls.length) {
      const payroll = payrolls.find(
        (p) =>
          p.employeeId === employeeId &&
          p.month === months[parseInt(month)] &&
          p.year === parseInt(year)
      );
      if (payroll) {
        setFormData({
          employeeId: payroll.employeeId,
          month: months.indexOf(payroll.month),
          year: payroll.year,
          earnings: payroll.earnings,
          deductions: payroll.deductions,
          status: payroll.status || 'Pending',
        });
      }
    }
  }, [employeeId, month, year, payrolls, months]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEarningsChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      earnings: { ...prev.earnings, [name]: parseFloat(value) || 0 },
    }));
  };

  const handleDeductionsChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      deductions: { ...prev.deductions, [name]: parseFloat(value) || 0 },
    }));
  };

  const calculateTotals = () => {
    const earningsTotal = Object.values(formData.earnings).reduce((sum, val) => sum + (val || 0), 0);
    const deductionsTotal = Object.values(formData.deductions).reduce((sum, val) => sum + (val || 0), 0);
    const inHandSalary = earningsTotal - deductionsTotal;
    return { earningsTotal, deductionsTotal, inHandSalary };
  };

  const { earningsTotal, deductionsTotal, inHandSalary } = calculateTotals();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const payload = {
      ...formData,
      month: months[formData.month],
      earnings: { ...formData.earnings, totalEarnings: earningsTotal },
      deductions: { ...formData.deductions, total: deductionsTotal },
      ctc: earningsTotal,
      inHandSalary,
    };

    try {
      const result = await updateEmployeePayroll(formData.employeeId, payload);
      if (result.success) {
        setSuccess('Payroll updated successfully!');
        setTimeout(() => navigate('/admin/payroll'), 2000);
      } else {
        setError(result.error || 'Failed to update payroll');
      }
    } catch (err) {
      setError('Failed to update payroll');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-5 max-w-screen-xl mx-auto">
      <h2 className="text-2xl font-semibold text-gray-800 mb-5">Update Payroll</h2>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
      {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{success}</div>}

      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        {/* Employee Select - disabled */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="employeeId">Employee</label>
          <select
            id="employeeId"
            name="employeeId"
            value={formData.employeeId}
            disabled
            className="shadow appearance-none border rounded w-full py-2 px-3"
          >
            <option value="">Select Employee</option>
            {employees.map(emp => (
              <option key={emp._id} value={emp._id}>{emp.name} ({emp.designation})</option>
            ))}
          </select>
        </div>

        {/* Month and Year selects - disabled */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="month">Month</label>
            <select id="month" name="month" value={formData.month}  className="shadow appearance-none border rounded w-full py-2 px-3">
              {months.map((m, i) => <option key={m} value={i}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="year">Year</label>
            <select id="year" name="year" value={formData.year} className="shadow appearance-none border rounded w-full py-2 px-3">
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        {/* Earnings inputs */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Earnings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(formData.earnings).map(([key, value]) => (
              <div key={key}>
                <label className="block text-gray-700 text-sm font-bold mb-2 capitalize" htmlFor={`earnings-${key}`}>
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </label>
                <input
                  type="number"
                  id={`earnings-${key}`}
                  name={key}
                  value={value}
                  onChange={handleEarningsChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3"
                  min="0"
                  step="0.01"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Deductions inputs */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Deductions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(formData.deductions).map(([key, value]) => (
              <div key={key}>
                <label className="block text-gray-700 text-sm font-bold mb-2 capitalize" htmlFor={`deductions-${key}`}>
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </label>
                <input
                  type="number"
                  id={`deductions-${key}`}
                  name={key}
                  value={value}
                  onChange={handleDeductionsChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3"
                  min="0"
                  step="0.01"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded">
              <h4 className="font-medium text-blue-800">Total Earnings</h4>
              <p className="text-xl font-bold">${earningsTotal.toFixed(2)}</p>
            </div>
            <div className="bg-red-50 p-4 rounded">
              <h4 className="font-medium text-red-800">Total Deductions</h4>
              <p className="text-xl font-bold">${deductionsTotal.toFixed(2)}</p>
            </div>
            <div className="bg-green-50 p-4 rounded">
              <h4 className="font-medium text-green-800">In-Hand Salary</h4>
              <p className="text-xl font-bold">${inHandSalary.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Status select */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="status">Status</label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3"
          >
            <option value="Pending">Pending</option>
            <option value="Processed">Processed</option>
            <option value="Paid">Paid</option>
          </select>
        </div>

        {/* Submit button */}
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Payroll'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdatePayroll;
