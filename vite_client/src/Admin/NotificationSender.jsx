import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createNotification } from '../context/notificationSlice';
import { toast } from 'react-toastify';

const NotificationSender = () => {
  const [message, setMessage] = useState('');
  const dispatch = useDispatch();
  const { status, error } = useSelector((state) => state.notifications);

  const handleSend = () => {
    if (!message.trim()) {
      toast.warning('Please enter a message before sending');
      return;
    }
    dispatch(createNotification(message))
      .unwrap()
      .then(() => {
        toast.success('Announcement sent successfully!');
        setMessage('');
      })
      .catch((err) => {
        toast.error(`Failed to send: ${err.message}`);
      });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-6 rounded-xl shadow-md bg-white w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Send Announcement</h2>
        <div className="flex items-center space-x-2">
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
            {message.length}/500
          </span>
        </div>
      </div>
      
      <textarea
        rows={4}
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-4 transition-all"
        placeholder="Type your important announcement here..."
        value={message}
        onChange={(e) => setMessage(e.target.value.slice(0, 500))}
        onKeyDown={handleKeyDown}
        maxLength={500}
      />
      
      <div className="flex justify-between items-center">
        <div>
          {error && (
            <p className="text-red-600 text-sm">
              <span className="font-medium">Error:</span> {error}
            </p>
          )}
        </div>
        <button
          onClick={handleSend}
          disabled={status === 'loading' || !message.trim()}
          className={`px-5 py-2 rounded-lg font-medium transition-all ${
            status === 'loading'
              ? 'bg-blue-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          } text-white shadow-sm`}
        >
          {status === 'loading' ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Sending...
            </span>
          ) : (
            'Send Announcement'
          )}
        </button>
      </div>
    </div>
  );
};

export default NotificationSender;