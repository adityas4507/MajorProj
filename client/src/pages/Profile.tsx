import React from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { useAuth } from '../hooks/useAuth';

export const Profile: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleRequestDeletion = async () => {
        if (confirm('Are you sure you want to request account deletion? Your account will be deleted in 30 days.')) {
            try {
                await authApi.requestDeletion();
                toast.success('Account deletion requested');
                logout();
                navigate('/login');
            } catch (error) {
                toast.error('Failed to request deletion');
            }
        }
    };

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />

                <main className="flex-1 overflow-y-auto p-6">
                    <h1 className="text-2xl font-bold text-gray-800 mb-6">Profile</h1>

                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm max-w-2xl p-6">
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Email</label>
                                <div className="mt-1 text-lg text-gray-900">{user?.email}</div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-500">User ID</label>
                                <div className="mt-1 text-sm font-mono text-gray-600 bg-gray-50 p-2 rounded">
                                    {user?.id}
                                </div>
                            </div>

                            <div className="pt-6 border-t border-gray-200">
                                <h3 className="text-lg font-medium text-red-600 mb-4">Danger Zone</h3>
                                <p className="text-sm text-gray-600 mb-4">
                                    Once you request deletion, your account will be deactivated immediately and permanently deleted after 30 days.
                                </p>
                                <button
                                    onClick={handleRequestDeletion}
                                    className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-md hover:bg-red-100 transition-colors"
                                >
                                    Request Account Deletion
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};
