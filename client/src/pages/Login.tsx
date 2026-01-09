import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth';
import { useAuth } from '../hooks/useAuth';

export const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const data = await authApi.login(email, password);
            login(data.accessToken, data.refreshToken, data.user);
            toast.success('Welcome back!');
            navigate('/');
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Login failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md w-96 border border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white">Sign in to DriveClone</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white p-2 border"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white p-2 border"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
                    >
                        Sign In
                    </button>
                </form>

                <div className="mt-6">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">Or continue with</span>
                        </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                        <button
                            type="button"
                            disabled
                            className="flex-1 flex items-center justify-center gap-2 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-4 bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-60"
                        >
                            <img
                                src="https://www.google.com/favicon.ico"
                                alt="Google"
                                className="w-5 h-5 opacity-50 grayscale"
                            />
                            <span>Google</span>
                        </button>
                        <button
                            type="button"
                            className="flex items-center justify-center border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                            onClick={() => toast('Only works in the hosted version', { icon: 'ℹ️' })}
                            title="Only works in the hosted version"
                        >
                            ?
                        </button>
                    </div>

                </div>

                <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-primary hover:underline">
                        Create one
                    </Link>
                </p>
            </div>
        </div>
    );
};
