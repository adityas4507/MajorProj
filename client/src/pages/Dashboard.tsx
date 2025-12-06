import { ArrowLeft, FolderPlus, Upload } from 'lucide-react';
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { FolderGrid } from '../components/FolderGrid';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { useFiles } from '../hooks/useFiles'; // Note: useFiles exports useFiles and useTrash, but we need useFolders from separate file? No, I put useFolders in useFolders.ts
import { useFolders as useFoldersHook } from '../hooks/useFolders';

export const Dashboard: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
    const folderId = searchParams.get('folderId') || undefined;

    const {
        files,
        folders,
        isLoading,
        uploadFile,
        isUploading,
        deleteFile,
        downloadFile
    } = useFiles(folderId);

    const { createFolder, renameFolder, deleteFolder } = useFoldersHook(folderId);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            uploadFile(e.target.files[0]);
        }
    };

    const handleCreateFolder = () => {
        const name = prompt('Enter folder name:');
        if (name) createFolder(name);
    };

    const handleNavigate = (newFolderId: string) => {
        setSearchParams({ folderId: newFolderId });
    };

    const handleBack = () => {
        setSearchParams({});
    };

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <div className="flex-1 flex flex-col overflow-hidden w-full">
                <Header onMenuClick={() => setIsSidebarOpen(true)} />

                <main className="flex-1 overflow-y-auto p-4 md:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-4">
                            {folderId && (
                                <button onClick={handleBack} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                                </button>
                            )}
                            <h1 className="text-xl md:text-2xl font-bold text-gray-800 truncate">
                                {folderId ? 'Folder' : 'My Files'}
                            </h1>
                        </div>

                        <div className="flex items-center gap-3 self-end sm:self-auto">
                            <button
                                onClick={handleCreateFolder}
                                className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium text-sm md:text-base transition-colors shadow-sm"
                            >
                                <FolderPlus className="w-4 h-4" />
                                <span className="hidden sm:inline">New Folder</span>
                            </button>
                            <label className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 bg-primary text-white rounded-lg hover:bg-blue-600 font-medium text-sm md:text-base transition-colors cursor-pointer shadow-sm active:scale-95 transform">
                                <Upload className="w-4 h-4" />
                                <span>{isUploading ? 'Uploading...' : 'Upload'}</span>
                                <input type="file" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
                            </label>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : (
                        <FolderGrid
                            folders={folders}
                            files={files}
                            onNavigate={handleNavigate}
                            onDownload={(file) => downloadFile({ id: file.id, name: file.name })}
                            onDelete={(file) => deleteFile(file.id)}
                            onRenameFolder={(id, name) => renameFolder({ id, name })}
                            onDeleteFolder={deleteFolder}
                        />
                    )}
                </main>
            </div>
        </div>
    );
};

