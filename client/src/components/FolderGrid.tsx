import { Edit2, Folder, MoreVertical, Trash2 } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import type { File, Folder as FolderType } from '../api/types';
import { FileCard } from './FileCard';

interface FolderGridProps {
    folders: FolderType[];
    files: File[];
    onNavigate: (folderId: string) => void;
    onDownload: (file: File) => void;
    onDelete: (file: File) => void;
    onRenameFolder: (id: string, name: string) => void;
    onDeleteFolder: (id: string) => void;
}

export const FolderGrid: React.FC<FolderGridProps> = ({
    folders,
    files,
    onNavigate,
    onDownload,
    onDelete,
    onRenameFolder,
    onDeleteFolder
}) => {
    const [activeMenu, setActiveMenu] = useState<string | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setActiveMenu(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleRename = (e: React.MouseEvent, folder: FolderType) => {
        e.stopPropagation();
        setActiveMenu(null);
        const newName = prompt('Enter new folder name:', folder.name);
        if (newName && newName !== folder.name) {
            onRenameFolder(folder.id, newName);
        }
    };

    const handleDelete = (e: React.MouseEvent, folder: FolderType) => {
        e.stopPropagation();
        setActiveMenu(null);
        if (confirm(`Are you sure you want to delete "${folder.name}"? All contents will be moved to trash.`)) {
            onDeleteFolder(folder.id);
        }
    };

    if (folders.length === 0 && files.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <Folder className="w-16 h-16 mb-4 opacity-20" />
                <p>This folder is empty</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {folders.length > 0 && (
                <div>
                    <h2 className="text-sm font-medium text-gray-500 mb-4 uppercase tracking-wider">Folders</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {folders.map((folder) => (
                            <div key={folder.id} className="relative group">
                                <button
                                    onClick={() => onNavigate(folder.id)}
                                    className="w-full flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md hover:border-primary/30 transition-all text-left active:scale-95"
                                >
                                    <Folder className="w-6 h-6 text-gray-400 fill-gray-100 group-hover:text-primary group-hover:fill-blue-50 transition-colors" />
                                    <span className="font-medium text-gray-700 truncate group-hover:text-primary transition-colors flex-1">{folder.name}</span>
                                </button>

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveMenu(activeMenu === folder.id ? null : folder.id);
                                    }}
                                    className="absolute top-3 right-2 p-1 rounded-full hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <MoreVertical className="w-4 h-4 text-gray-500" />
                                </button>

                                {activeMenu === folder.id && (
                                    <div ref={menuRef} className="absolute top-8 right-2 w-32 bg-white rounded-lg shadow-xl border border-gray-100 z-10 py-1">
                                        <button
                                            onClick={(e) => handleRename(e, folder)}
                                            className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                        >
                                            <Edit2 className="w-3 h-3" /> Resize
                                        </button>
                                        <button
                                            onClick={(e) => handleDelete(e, folder)}
                                            className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                        >
                                            <Trash2 className="w-3 h-3" /> Delete
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {files.length > 0 && (
                <div>
                    <h2 className="text-sm font-medium text-gray-500 mb-4 uppercase tracking-wider">Files</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {files.map((file) => (
                            <FileCard
                                key={file.id}
                                file={file}
                                onDownload={onDownload}
                                onDelete={onDelete}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
