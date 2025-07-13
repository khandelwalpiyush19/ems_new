import React, { useState } from 'react';
import axios from 'axios';
import { EMPLOYEE_AUTH_ENDPOINT } from '../utils/constant';
import { X } from 'lucide-react'; // Or use any close icon you prefer

export default function PasswordResetPopup({ onClose }) {
  const [passwords, setPasswords] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (passwords.newPassword !== passwords.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (passwords.newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      const response = await axios.patch(`${EMPLOYEE_AUTH_ENDPOINT}/reset-password`, {
        newPassword: passwords.newPassword
      }, {
        withCredentials: true
      });

      if (response.data.message === 'Password reset successful.') {
        setSuccess(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
        {/* Close icon */}
        <button
          className="absolute top-3 right-3 text-gray-600 hover:text-black"
          onClick={onClose}
        >
          <X size={20} />
        </button>

        {success ? (
          <div className="text-center">
            <h2 className="text-xl font-bold mb-2">✅ Password Updated!</h2>
            <p>You can now continue using the app.</p>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-bold mb-4">Reset Your Password</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <input
                  type="password"
                  placeholder="New Password"
                  className="w-full p-2 border rounded"
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                  required
                />
              </div>
              <div className="mb-4">
                <input
                  type="password"
                  placeholder="Confirm Password"
                  className="w-full p-2 border rounded"
                  value={passwords.confirmPassword}
                  onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                  required
                />
              </div>
              {error && <p className="text-red-500 mb-2">{error}</p>}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-300 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Reset Password
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
