import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  clockIn, 
  clockOut, 
  breakIn, 
  breakOut
} from '../../context/attendanceSlice';
import { format, parseISO } from 'date-fns';
import { FiClock, FiHome, FiMapPin, FiCalendar, FiCoffee, FiPause, FiPlay } from 'react-icons/fi';

const AttendanceBox = () => {
  const dispatch = useDispatch();
  const {
    sessions,
    error,
    loading,
    dailyStats,
    breakSession
  } = useSelector((state) => state.attendance);

  const [workLocation, setWorkLocation] = useState('office');
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [currentSession, setCurrentSession] = useState(null);

  useEffect(() => {
    if (sessions && sessions.length > 0) {
      const openSession = sessions.find(session => !session.clockOut);
      setCurrentSession(openSession || null);
    } else {
      setCurrentSession(null);
    }
  }, [sessions]);

  const handleClockIn = async () => {
    try {
      const openSession = sessions.find(session => !session.clockOut);

      if (openSession) {
        showNotification(
          `You have an open session since ${formatTime(openSession.clockIn)}. Please clock out first.`,
          'error'
        );
        return;
      }

     await dispatch(clockIn(workLocation)).unwrap();
      showNotification('Checked in successfully!', 'success');
    } catch (err) {
      const errorMessage = err?.message || err?.payload?.message || 'Failed to check in. Please try again.';
      showNotification(errorMessage, 'error');
    }
  };

  const handleClockOut = async () => {
    if (!currentSession) return;
    try {
      await dispatch(clockOut(currentSession._id)).unwrap();
      showNotification('Checked out successfully!', 'success');
    } catch (err) {
      const errorMessage = err?.message || 'Failed to check out';
      showNotification(errorMessage, 'error');
    }
  };

  const handleBreakIn = async () => {
    try {
      await dispatch(breakIn()).unwrap();
      showNotification('Break started successfully!', 'success');
    } catch (err) {
      const errorMessage = err?.message || err?.payload?.message || 'Failed to start break. Please try again.';
      showNotification(errorMessage, 'error');
    }
  };

  const handleBreakOut = async () => {
    try {
      await dispatch(breakOut()).unwrap();
      showNotification('Break ended successfully!', 'success');
    } catch (err) {
      const errorMessage = err?.message || err?.payload?.message || 'Failed to end break. Please try again.';
      showNotification(errorMessage, 'error');
    }
  };

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };
 



  const formatTime = (dateString) => {
    if (!dateString) return '--:--';
    return format(parseISO(dateString), 'HH:mm');
  };

  const todayKey = format(new Date(), 'yyyy-MM-dd');
  const todayStats = dailyStats?.[todayKey] || { sessions: [], totalEffectiveHours: 0, totalGrossHours: 0 };
  const totalSessions = todayStats.sessions.length;
  const totalHours = todayStats.totalEffectiveHours || 0;

  const isOnBreak = !!breakSession;
  const canTakeBreak = currentSession && !isOnBreak;
  const canEndBreak = isOnBreak;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className='flex flex-row justify-between mb-2'>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Today's Attendance</h2>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
          <p>{typeof error === 'string' ? error : error.message}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {currentSession ? (
            <div>
              <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-4">
                <p>You are currently checked in since {formatTime(currentSession.clockIn)}</p>
                {isOnBreak && (
                  <p className="mt-2">
                    <FiCoffee className="inline mr-1" />
                    On break since {formatTime(breakSession.breakIn)}
                  </p>
                )}
              </div>

              <div className="flex items-center mb-2">
                <FiMapPin className="text-gray-500 mr-2" />
                <span className="text-gray-700">Location: {currentSession.workLocation === 'office' ? 'Office' : 'Home'}</span>
              </div>

              <div className="flex items-center mb-4">
                <FiClock className="text-gray-500 mr-2" />
                <span className="text-gray-700">Checked in at: {formatTime(currentSession.clockIn)}</span>
              </div>

              <div className="flex space-x-4 mb-4">
                <button
                  onClick={handleClockOut}
                  disabled={loading || isOnBreak}
                  className={`flex-1 py-2 px-4 rounded-md text-white font-medium ${
                    loading || isOnBreak ? 'bg-gray-400' : 'bg-red-500 hover:bg-red-600'
                  }`}
                >
                  {loading ? 'Processing...' : 'Check Out'}
                </button>

                {canTakeBreak && (
                  <button
                    onClick={handleBreakIn}
                    disabled={loading}
                    className={`flex-1 py-2 px-4 rounded-md text-white font-medium flex items-center justify-center ${
                      loading ? 'bg-gray-400' : 'bg-yellow-500 hover:bg-yellow-600'
                    }`}
                  >
                    <FiPause className="mr-2" />
                    {loading ? 'Processing...' : 'Start Break'}
                  </button>
                )}

                {canEndBreak && (
                  <button
                    onClick={handleBreakOut}
                    disabled={loading}
                    className={`flex-1 py-2 px-4 rounded-md text-white font-medium flex items-center justify-center ${
                      loading ? 'bg-gray-400' : 'bg-green-500 hover:bg-green-600'
                    }`}
                  >
                    <FiPlay className="mr-2" />
                    {loading ? 'Processing...' : 'End Break'}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className='flex flex-row justify-between'>
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-3">Select Work Location:</p>
                <div className="flex space-x-6">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="workLocation"
                      value="office"
                      checked={workLocation === 'office'}
                      onChange={(e) => setWorkLocation(e.target.value)}
                      className="mr-2 text-blue-500"
                    />
                    <FiMapPin className="text-blue-500 mr-1" />
                    <span className="text-gray-700">Work from Office</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="workLocation"
                      value="work_from_home"
                      checked={workLocation === 'work_from_home'}
                      onChange={(e) => setWorkLocation(e.target.value)}
                      className="mr-2 text-green-500"
                    />
                    <FiHome className="text-green-500 mr-1" />
                    <span className="text-gray-700">Work from Home</span>
                  </label>
                </div>
              </div>

              <button
                onClick={handleClockIn}
                disabled={loading}
                className={`w-1/4 py-2 px-4 rounded-md text-white font-medium ${
                  loading ? 'bg-gray-400' : 'bg-green-500 hover:bg-green-600'
                }`}
              >
                {loading ? 'Processing...' : 'Check In'}
              </button>
            </div>
          )}

          {dailyStats && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center mb-3">
                <FiCalendar className="text-gray-500 mr-2" />
                <h3 className="text-md font-medium text-gray-800">Today's Summary</h3>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-sm text-gray-500">Total Sessions</p>
                  <p className="font-semibold">{totalSessions}</p>
                </div>

                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-sm text-gray-500">Total Hours</p>
                  <p className="font-semibold">{totalHours.toFixed(2)}h</p>
                </div>

                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-sm text-gray-500">Current Status</p>
                  <p className="font-semibold">
                    {isOnBreak ? 'On Break' : currentSession ? 'Working' : 'Not Checked In'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {notification.show && (
        <div className={`fixed bottom-4 right-4 p-4 rounded-md shadow-lg text-white ${
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`}>
          {notification.message}
        </div>
      )}
    </div>
  );
};

export default AttendanceBox;
