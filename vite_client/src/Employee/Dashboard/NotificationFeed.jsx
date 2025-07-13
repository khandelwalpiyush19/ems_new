import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addNotification } from '../../context/notificationSlice';
import { BOTH_NOTIFICATION_ENDPOINT } from '../../utils/constant';

const NotificationFeed = () => {
  const dispatch = useDispatch();
  const allNotifications = useSelector((state) => state.notifications.list || []);
  const [visibleNotifications, setVisibleNotifications] = useState([]);
  const [recentIds, setRecentIds] = useState(new Set());
 const [readIds, setReadIds] = useState(() => {
  try {
    const saved = localStorage.getItem('readNotifications');
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? new Set(parsed) : new Set();
  } catch {
    return new Set();
  }
});


  useEffect(() => {
    const eventSource = new EventSource(`${BOTH_NOTIFICATION_ENDPOINT}/get-all-notification`, {
      withCredentials: true,
    });

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (Array.isArray(data)) {
          dispatch(addNotification(data));

          const filtered = data.filter(n => !readIds.has(n._id));
          setVisibleNotifications((prev) => [...prev, ...filtered]);

          const newIds = filtered.map((n) => n._id);
          setRecentIds((prev) => new Set([...prev, ...newIds]));
          setTimeout(() => {
            setRecentIds((prev) => {
              const updated = new Set(prev);
              newIds.forEach((id) => updated.delete(id));
              return updated;
            });
          }, 3000);
        }
      } catch (err) {
        console.error('Error parsing SSE data:', err);
      }
    };

    eventSource.onerror = (err) => {
      console.error('SSE connection error:', err);
      eventSource.close();
    };

    return () => eventSource.close();
  }, [dispatch, readIds]);

  const handleRead = (id) => {
    const updated = visibleNotifications.filter((n) => n._id !== id);
    setVisibleNotifications(updated);

    const newReadIds = new Set(readIds);
    newReadIds.add(id);
    setReadIds(newReadIds);
    localStorage.setItem('readNotifications', JSON.stringify([...newReadIds]));
  };

  // Filter again on page load (not just on SSE)
  useEffect(() => {
    const freshVisible = allNotifications.filter(n => !readIds.has(n._id));
    setVisibleNotifications(freshVisible);
  }, [allNotifications, readIds]);

  return (
    <div className="p-4 border-gray-200 rounded-lg shadow-md w-full  mt-2 bg-white">
      <h2 className="text-xl font-semibold mb-2">Announcements</h2>
      {visibleNotifications.length === 0 ? (
        <p className="text-gray-600">No notifications yet.</p>
      ) : (
        <ul className="space-y-2 max-h-64 overflow-y-auto">
          {[...visibleNotifications].reverse().map((note) => (
            <li
              key={note._id}
              className={`border p-2 rounded shadow-sm flex justify-between items-start transition-all duration-300 ${
                recentIds.has(note._id) ? 'bg-red-100 border-red-400' : 'bg-gray-50'
              }`}
            >
              <div>
                <p className="text-sm">{note.message}</p>
                <span className="text-xs text-gray-500">
                  {new Date(note.createdAt).toLocaleString()}
                </span>
              </div>
              <button
                onClick={() => handleRead(note._id)}
                className="ml-2 text-xs text-white bg-green-600 px-2 py-1 rounded hover:bg-green-700"
              >
                Mark as Read
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};


export default NotificationFeed;
