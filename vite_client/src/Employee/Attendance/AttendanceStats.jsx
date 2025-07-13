import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLogs } from '../../context/attendanceSlice';
import { FiCalendar, FiClock, FiTrendingUp, FiHome, FiAlertTriangle } from 'react-icons/fi';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AttendanceStats = () => {
  const dispatch = useDispatch();
  const { summary, sessions, loading, error } = useSelector((state) => state.attendance);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Group sessions by date for dailyStats
  const groupedStats = useMemo(() => {
    const result = {};
    if (sessions && sessions.length > 0) {
      sessions.forEach((session) => {
        const dateKey = new Date(session.date).toISOString().split('T')[0];
        if (!result[dateKey]) {
          result[dateKey] = { sessions: [] };
        }
        result[dateKey].sessions.push(session);
      });
    }
    return result;
  }, [sessions]);

  useEffect(() => {
    dispatch(fetchLogs());
  }, [dispatch]);

  if (loading) {
    return <div className="text-center py-10 text-gray-500">Loading attendance data...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">Error: {error}</div>;
  }

  if (!summary || !sessions || sessions.length === 0) {
    return <div className="text-center py-10 text-gray-500">No attendance data available.</div>;
  }

  // Calculate work location distribution
  const workLocationCounts = sessions.reduce(
    (acc, session) => {
      if (session.workLocation === 'work_from_home') acc.wfh += 1;
      else acc.office += 1;
      return acc;
    },
    { wfh: 0, office: 0 }
  );

  // Prepare data for the bar chart
  const chartData = {
    labels: ['Effective Hours', 'Overtime', 'Late Arrivals', 'Early Departures'],
    datasets: [
      {
        label: 'Stats',
        data: [
          summary.totalEffectiveHours,
          summary.totalOvertime,
          summary.totalLateArrivals,
          summary.totalEarlyDepartures
        ],
        backgroundColor: [
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 159, 64, 0.7)',
          'rgba(255, 99, 132, 0.7)',
          'rgba(255, 206, 86, 0.7)'
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(255, 206, 86, 1)'
        ],
        borderWidth: 1,
      },
    ],
  };

  const formatTime = (timeString) => {
    if (!timeString) return '--:--';
    const date = new Date(timeString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className={`min-h-screen bg-gray-100 ${isMobile ? 'pt-16' : 'ml-64'}`}>
      <div className="mx-auto p-4 max-w-screen-2xl">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Attendance Statistics</h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4 flex items-center">
            <div className="bg-blue-100 p-2 rounded-full mr-3">
              <FiCalendar className="text-blue-600 text-lg" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Days</p>
              <p className="text-xl font-bold text-gray-800">{summary.totalDays}</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 flex items-center">
            <div className="bg-green-100 p-2 rounded-full mr-3">
              <FiClock className="text-green-600 text-lg" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Effective Hours</p>
              <p className="text-xl font-bold text-gray-800">{summary.totalEffectiveHours.toFixed(2)}</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 flex items-center">
            <div className="bg-purple-100 p-2 rounded-full mr-3">
              <FiTrendingUp className="text-purple-600 text-lg" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Overtime</p>
              <p className="text-xl font-bold text-gray-800">{summary.totalOvertime.toFixed(2)}</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 flex items-center">
            <div className="bg-red-100 p-2 rounded-full mr-3">
              <FiAlertTriangle className="text-red-600 text-lg" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Attendance Issues</p>
              <p className="text-xl font-bold text-gray-800">
                {summary.totalLateArrivals + summary.totalEarlyDepartures}
              </p>
            </div>
          </div>
        </div>

        {/* Work Location Stats */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Work Location Distribution</h2>
          <div className="flex justify-between">
            <div className="text-center">
              <div className="text-xl font-bold text-blue-600">{workLocationCounts.office}</div>
              <div className="text-xs text-gray-500">Office</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-purple-600">{workLocationCounts.wfh}</div>
              <div className="text-xs text-gray-500">Work From Home</div>
            </div>
          </div>
        </div>

        {/* Main Chart */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Attendance Overview</h2>
          <div className="h-64">
            <Bar data={chartData} options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { 
                legend: { display: false },
                tooltip: {
                  callbacks: {
                    label: function(context) {
                      let label = context.dataset.label || '';
                      if (label) {
                        label += ': ';
                      }
                      if (context.parsed.y !== null) {
                        if (context.dataIndex < 2) {
                          label += `${context.parsed.y.toFixed(2)} hours`;
                        } else {
                          label += context.parsed.y;
                        }
                      }
                      return label;
                    }
                  }
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    callback: function(value) {
                      return Number.isInteger(value) ? value : value.toFixed(2);
                    }
                  }
                }
              }
            }} />
          </div>
        </div>

        {/* Recent Sessions Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
          <div className="px-4 py-3 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Recent Sessions</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-max divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clock In</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clock Out</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sessions.slice(0, 10).map((session, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">
                      {formatDate(session.date)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">
                      {formatTime(session.clockIn)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">
                      {session.clockOut ? formatTime(session.clockOut) : '--:--'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">
                      {session.effectiveHours > 0 ? `${session.effectiveHours.toFixed(2)}` : '--'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {session.status === 'present' ? (
                        session.isLateArrival || session.isEarlyDeparture ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Partial
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Present
                          </span>
                        )
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          {session.status}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">
                      <div className="flex items-center">
                        <FiHome className="mr-1" />
                        {session.workLocation === 'work_from_home' ? 'WFH' : 'Office'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceStats;