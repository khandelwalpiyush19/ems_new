import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setLoading, setUser } from '../context/Auth/authSlice';
import { toast } from 'react-toastify';

function Login() {
    const [form, setForm] = useState({ email: '', password: '' });
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, user } = useSelector(state => state.auth);

    useEffect(() => {
        if (user) {
            const role = localStorage.getItem('role');
            navigate(role === 'admin' ? '/dashboard-admin' : '/dashboard-employee');
        }
    }, [user]);

    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async e => {
        e.preventDefault();

        const emailDomain = form.email.split('@')[1];

        if (!form.email.includes('@') || !emailDomain) {
            toast.error('Please enter a valid email address');
            return;
        }

        let apiEndpoint = '';
        let userRole = '';

        if (emailDomain === 'gmail.com') {
            apiEndpoint = '/api/v1/admin/auth/login';
            userRole = 'admin';
        } else if (emailDomain === 'paarsiv.com') {
            apiEndpoint = '/api/v1/employee/auth/login';
            userRole = 'employee';
        } else {
            toast.error('Only @gmail.com and @paarsiv.com domains are allowed.');
            return;
        }

        try {
            dispatch(setLoading(true));

            const response = await fetch(`http://localhost:5000${apiEndpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(form)
            });

            const text = await response.text();

            try {
                const data = text ? JSON.parse(text) : {};

                if (response.status === 401) {
                    toast.error(data.message || 'Invalid credentials.');
                    return;
                }

                if (!response.ok) {
                    throw new Error(data.message || `Error: ${response.status}`);
                }

                dispatch(setUser(data.employee || data.admin || data.user));
                localStorage.setItem('token', data.token);
                localStorage.setItem('role', userRole);
                localStorage.setItem('email', form.email);

                toast.success('Login successful!');
                navigate(userRole === 'admin' ? '/dashboard-admin' : '/dashboard-employee');
            } catch (jsonError) {
                if (text.startsWith('<!DOCTYPE html>')) {
                    throw new Error('Unexpected HTML response. Check API server.');
                }
                throw jsonError;
            }
        } catch (err) {
            console.error('Login failed:', err);
            toast.error(err.message || 'Login error.');
        } finally {
            dispatch(setLoading(false));
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-cover bg-center bg-fixed"
             style={{ backgroundImage: "url('../media/Untitled-2 (2).png')" }}>
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm text-center">
                <h1 className="text-2xl font-bold text-green-500 mb-2">Login</h1>
                <p className="text-green-500 mb-5">Login to your account.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        name="email"
                        placeholder="E-mail Address"
                        type="email"
                        onChange={handleChange}
                        value={form.email}
                        required
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                    />
                    <input
                        name="password"
                        placeholder="Password"
                        type="password"
                        onChange={handleChange}
                        value={form.password}
                        required
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {loading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>

                <p className="mt-5 text-sm">
                    Don't have an account?{' '}
                    <a href="/register" className="text-blue-500 hover:text-blue-700 hover:underline">
                        Create New
                    </a>
                </p>
                <Link to="/forgot-password" className='text-right text-sm text-blue-500 hover:text-blue-700 hover:underline'>
  Forgot Password?
</Link>
            </div>
        </div>
    );
}

export default Login;
