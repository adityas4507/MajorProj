import { LogOut, Moon, Sun, Trash2 } from 'lucide-react';
import React from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../hooks/useAuth';

export const Profile: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();

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

    const formatBytes = (bytes: string) => {
        const b = BigInt(bytes);
        const units = ['B', 'KB', 'MB', 'GB', 'TB'];
        let size = Number(b);
        let i = 0;
        while (size >= 1024 && i < units.length - 1) {
            size /= 1024;
            i++;
        }
        return `${size.toFixed(1)} ${units[i]}`;
    };

    const used = user?.usedBytes ? BigInt(user.usedBytes) : BigInt(0);
    const total = user?.totalQuotaBytes ? BigInt(user.totalQuotaBytes) : BigInt(1);
    const percentage = Number((used * 100n) / total);

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Profile</h1>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-primary dark:text-blue-300 text-2xl font-bold">
                        {user?.email?.[0].toUpperCase()}
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">{user?.email}</h2>
                        <div className="mt-1 text-xs font-mono text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 p-1 rounded inline-block">
                            ID: {user?.id}
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Storage Used</span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                {formatBytes(user?.usedBytes || '0')} / {formatBytes(user?.totalQuotaBytes || '0')}
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                            <div
                                className="bg-primary h-2.5 rounded-full transition-all duration-500"
                                style={{ width: `${Math.min(percentage, 100)}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
                <button
                    onClick={toggleTheme}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                >
                    <div className="flex items-center gap-3">
                        {theme === 'light' ? <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" /> : <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300" />}
                        <span className="font-medium text-gray-700 dark:text-gray-200">Appearance</span>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">{theme} Mode</span>
                </button>

                <button
                    onClick={handleRequestDeletion}
                    className="w-full flex items-center gap-3 p-4 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 transition-colors text-left"
                >
                    <Trash2 className="w-5 h-5" />
                    <span className="font-medium">Request Account Deletion</span>
                </button>

                <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors text-left"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Sign Out</span>
                </button>
            </div>

            <div className="text-center text-xs text-gray-400 dark:text-gray-600 mt-8">
                DriveClone v1.0.0
            </div>
        </div>
    );
};
