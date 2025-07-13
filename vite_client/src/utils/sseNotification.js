// utils/sseNotification.js
import { addNotification } from '../redux/slices/notificationSlice';

export const startNotificationStream = (dispatch) => {
  const eventSource = new EventSource('/api/v1/admin/notification/get-all-notification', {
    withCredentials: true, // Optional: depends on cookie-based auth
  });

  eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);
    dispatch(addNotification(data));
  };

  eventSource.onerror = (err) => {
    console.error('SSE error:', err);
    eventSource.close(); // Optional reconnection logic
  };

  return eventSource;
};
