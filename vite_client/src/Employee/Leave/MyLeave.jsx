import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getEmployeeLeaves } from '../../context/employeeLeaveSlice'; 
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { FaCalendarAlt, FaUmbrellaBeach, FaChartPie, FaChartBar } from 'react-icons/fa';
import { MdSick } from 'react-icons/md';
import { BsCalendarCheck } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const MyLeavePage = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const dispatch = useDispatch();
  const state = useSelector((state) => state.employeeLeave);
  const [activeTab, setActiveTab] = useState('leaves');

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const navigate =  useNavigate();

  useEffect(() => {
    dispatch(getEmployeeLeaves());
  }, [dispatch]);

  const MAX_LEAVES = {
    sick: 12,
    annual: 12,
    casual: 12
  };

  const leavesData = state.myLeaves || [];
  const statsData = state.leaveStats || null;

  const calculatedStats = statsData && {
    totalLeaves: statsData.totalLeaves,
    remainingLeaves: statsData.remainingLeaves,
    sickLeaves: {
      taken: statsData.leavesByType?.sick || 0,
      remaining: MAX_LEAVES.sick - (statsData.leavesByType?.sick || 0)
    },
    annualLeaves: {
      taken: statsData.leavesByType?.annual || 0,
      remaining: MAX_LEAVES.annual - (statsData.leavesByType?.annual || 0)
    },
    casualLeaves: {
      taken: statsData.leavesByType?.casual || 0,
      remaining: MAX_LEAVES.casual - (statsData.leavesByType?.casual || 0)
    }
  };

  const leaveHistory = leavesData.map((leave) => ({
    id: leave._id,
    type: leave.leaveType?.charAt(0).toUpperCase() + leave.leaveType?.slice(1),
    startDate: new Date(leave.startDate).toISOString().split('T')[0],
    endDate: new Date(leave.endDate).toISOString().split('T')[0],
    status: leave.status?.charAt(0).toUpperCase() + leave.status?.slice(1),
    days: leave.duration
  }));

  if (state.loading) {
    return <div className="text-center py-10 text-gray-500">Loading leave data...</div>;
  }

  if (state.error) {
    return <div className="text-center py-10 text-red-500">Error: {state.error}</div>;
  }

  if (!statsData) {
    return <div className="text-center py-10 text-gray-500">No leave data available.</div>;
  }

  // Chart data
  const pieChartData = {
    labels: ['Sick Leaves Taken', 'Annual Leaves Taken', 'Casual Leaves Taken'],
    datasets: [
      {
        data: [
          calculatedStats.sickLeaves.taken,
          calculatedStats.annualLeaves.taken,
          calculatedStats.casualLeaves.taken
        ],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
        hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56']
      }
    ]
  };

  const barChartData = {
    labels: ['Sick', 'Annual', 'Casual'],
    datasets: [
      {
        label: 'Taken',
        data: [
          calculatedStats.sickLeaves.taken,
          calculatedStats.annualLeaves.taken,
          calculatedStats.casualLeaves.taken
        ],
        backgroundColor: '#3B82F6',
      },
      {
        label: 'Remaining',
        data: [
          calculatedStats.sickLeaves.remaining,
          calculatedStats.annualLeaves.remaining,
          calculatedStats.casualLeaves.remaining
        ],
        backgroundColor: '#10B981',
      }
    ]
  };

  return (
    <div className={`min-h-screen bg-gray-100 ${isMobile ? 'pt-16' : 'ml-64'}`}>
      <div className="p-4 md:p-8 max-w-screen-2xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">My Leave Dashboard</h1>
          <div className="flex space-x-2 w-full md:w-auto">
            <button
              onClick={() => setActiveTab('leaves')}
              className={`px-3 py-1 md:px-4 md:py-2 rounded-lg text-sm md:text-base ${
                activeTab === 'leaves' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              <FaCalendarAlt className="inline mr-1 md:mr-2" />
              My Leaves
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-3 py-1 md:px-4 md:py-2 rounded-lg text-sm md:text-base ${
                activeTab === 'stats' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              <FaChartPie className="inline mr-1 md:mr-2" />
              Statistics
            </button>
            <button 
                            onClick={() => navigate('/leave')}
                            className="bg-green-500 text-white rounded-xl px-3 py-1 md:px-4 md:py-2  hover:bg-green-800 transition text-sm md:text-base"
                        >
                            Apply for Leave
                        </button>
          </div>
        </header>

        {activeTab === 'leaves' ? (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg shadow-md">
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-blue-100 text-blue-600 mr-3">
                    <FaCalendarAlt size={20} />
                  </div>
                  <div>
                    <p className="text-xs md:text-sm text-gray-500">Total Leaves</p>
                    <h3 className="text-xl font-bold">{calculatedStats.totalLeaves}</h3>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-md">
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-green-100 text-green-600 mr-3">
                    <BsCalendarCheck size={20} />
                  </div>
                  <div>
                    <p className="text-xs md:text-sm text-gray-500">Remaining Leaves</p>
                    <h3 className="text-xl font-bold">{calculatedStats.remainingLeaves}</h3>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-md">
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-red-100 text-red-600 mr-3">
                    <MdSick size={20} />
                  </div>
                  <div>
                    <p className="text-xs md:text-sm text-gray-500">Sick Leaves Taken</p>
                    <h3 className="text-xl font-bold">{calculatedStats.sickLeaves.taken}</h3>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-md">
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-yellow-100 text-yellow-600 mr-3">
                    <FaUmbrellaBeach size={20} />
                  </div>
                  <div>
                    <p className="text-xs md:text-sm text-gray-500">Annual Leaves Taken</p>
                    <h3 className="text-xl font-bold">{calculatedStats.annualLeaves.taken}</h3>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">Leave History</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Days</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {leaveHistory.map((leave) => (
                      <tr key={leave.id}>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${leave.type === 'Sick' ? 'bg-red-100 text-red-800' :
                              leave.type === 'Annual' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-blue-100 text-blue-800'}`}>
                            {leave.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-xs md:text-sm text-gray-500">{leave.startDate}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-xs md:text-sm text-gray-500">{leave.endDate}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-xs md:text-sm text-gray-500">{leave.days}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${leave.status === 'Approved' ? 'bg-green-100 text-green-800' :
                              leave.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'}`}>
                            {leave.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <FaChartPie className="mr-2" /> Leave Distribution
              </h2>
              <div className="h-64">
                <Pie data={pieChartData} options={{ maintainAspectRatio: false }} />
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <FaChartBar className="mr-2" /> Leave Usage
              </h2>
              <div className="h-64">
                <Bar
                  data={barChartData}
                  options={{
                    maintainAspectRatio: false,
                    scales: {
                      x: { stacked: true },
                      y: { stacked: true }
                    }
                  }}
                />
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-md lg:col-span-2">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Leave Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border border-gray-200 rounded-lg p-3">
                  <h3 className="font-medium text-gray-700 mb-2 flex items-center">
                    <MdSick className="mr-2 text-red-500" /> Sick Leaves
                  </h3>
                  <div className="space-y-2">
                    <p className="text-xs md:text-sm text-gray-600">Taken: {calculatedStats.sickLeaves.taken}</p>
                    <p className="text-xs md:text-sm text-gray-600">Remaining: {calculatedStats.sickLeaves.remaining}</p>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-red-500 h-2.5 rounded-full"
                        style={{ width: `${(calculatedStats.sickLeaves.taken / MAX_LEAVES.sick) * 100}%` }}>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-3">
                  <h3 className="font-medium text-gray-700 mb-2 flex items-center">
                    <FaUmbrellaBeach className="mr-2 text-yellow-500" /> Annual Leaves
                  </h3>
                  <div className="space-y-2">
                    <p className="text-xs md:text-sm text-gray-600">Taken: {calculatedStats.annualLeaves.taken}</p>
                    <p className="text-xs md:text-sm text-gray-600">Remaining: {calculatedStats.annualLeaves.remaining}</p>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-yellow-500 h-2.5 rounded-full"
                        style={{ width: `${(calculatedStats.annualLeaves.taken / MAX_LEAVES.annual) * 100}%` }}>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-3">
                  <h3 className="font-medium text-gray-700 mb-2 flex items-center">
                    <FaCalendarAlt className="mr-2 text-blue-500" /> Casual Leaves
                  </h3>
                  <div className="space-y-2">
                    <p className="text-xs md:text-sm text-gray-600">Taken: {calculatedStats.casualLeaves.taken}</p>
                    <p className="text-xs md:text-sm text-gray-600">Remaining: {calculatedStats.casualLeaves.remaining}</p>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-blue-500 h-2.5 rounded-full"
                        style={{ width: `${(calculatedStats.casualLeaves.taken / MAX_LEAVES.casual) * 100}%` }}>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyLeavePage;