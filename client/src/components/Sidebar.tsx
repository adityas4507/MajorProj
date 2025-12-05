import clsx from 'clsx';
import { Cloud, HardDrive, Trash2, User, X } from 'lucide-react';
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
    const { user } = useAuth();

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

    const sidebarClasses = clsx(
        'fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col h-full transition-transform duration-300 ease-in-out md:relative md:translate-x-0',
        isOpen ? 'translate-x-0' : '-translate-x-full'
    );

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
                    onClick={onClose}
                />
            )}

            <div className={sidebarClasses}>
                <div className="p-6 flex items-center justify-between border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <Cloud className="w-8 h-8 text-primary" />
                        <span className="text-xl font-bold text-gray-700">DriveClone</span>
                    </div>
                    <button onClick={onClose} className="md:hidden p-1 hover:bg-gray-100 rounded-full">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <NavLink
                        to="/"
                        onClick={() => window.innerWidth < 768 && onClose()}
                        className={({ isActive }) =>
                            clsx(
                                'flex items-center gap-3 px-4 py-3 rounded-md transition-colors',
                                isActive ? 'bg-blue-50 text-primary' : 'text-gray-700 hover:bg-gray-100'
                            )
                        }
                    >
                        <HardDrive className="w-5 h-5" />
                        My Files
                    </NavLink>
                    <NavLink
                        to="/trash"
                        onClick={() => window.innerWidth < 768 && onClose()}
                        className={({ isActive }) =>
                            clsx(
                                'flex items-center gap-3 px-4 py-3 rounded-md transition-colors',
                                isActive ? 'bg-blue-50 text-primary' : 'text-gray-700 hover:bg-gray-100'
                            )
                        }
                    >
                        <Trash2 className="w-5 h-5" />
                        Trash
                    </NavLink>
                    <NavLink
                        to="/profile"
                        onClick={() => window.innerWidth < 768 && onClose()}
                        className={({ isActive }) =>
                            clsx(
                                'flex items-center gap-3 px-4 py-3 rounded-md transition-colors',
                                isActive ? 'bg-blue-50 text-primary' : 'text-gray-700 hover:bg-gray-100'
                            )
                        }
                    >
                        <User className="w-5 h-5" />
                        Profile
                    </NavLink>
                </nav>

                <div className="p-6 border-t border-gray-100">
                    <div className="flex items-center gap-2 mb-2 text-sm text-gray-600">
                        <Cloud className="w-4 h-4" />
                        <span>Storage</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div
                            className="bg-primary h-2 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                    </div>
                    <div className="text-xs text-gray-500">
                        {formatBytes(user?.usedBytes || '0')} used of {formatBytes(user?.totalQuotaBytes || '0')}
                    </div>
                </div>
            </div>
        </>
    );
};
