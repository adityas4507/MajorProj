import { Folder } from 'lucide-react';
import React from 'react';
import type { File, Folder as FolderType } from '../api/types';
import { FileCard } from './FileCard';

interface FolderGridProps {
    folders: FolderType[];
    files: File[];
    onNavigate: (folderId: string) => void;
    onDownload: (file: File) => void;
    onDelete: (file: File) => void;
}

export const FolderGrid: React.FC<FolderGridProps> = ({ folders, files, onNavigate, onDownload, onDelete }) => {
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
                            <button
                                key={folder.id}
                                onClick={() => onNavigate(folder.id)}
                                className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md hover:border-primary/30 transition-all text-left group active:scale-95"
                            >
                                <Folder className="w-6 h-6 text-gray-400 fill-gray-100 group-hover:text-primary group-hover:fill-blue-50 transition-colors" />
                                <span className="font-medium text-gray-700 truncate group-hover:text-primary transition-colors">{folder.name}</span>
                            </button>
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
