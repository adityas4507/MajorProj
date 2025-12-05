import { Download, FileText, Music, X } from 'lucide-react';
import React from 'react';
import { API_URL } from '../api/client';
import type { File } from '../api/types';

interface FilePreviewModalProps {
    file: File;
    onClose: () => void;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({ file, onClose }) => {
    const token = localStorage.getItem('accessToken');
    const fileUrl = `${API_URL}/files/${file.id}/view?token=${token}`;
    const downloadUrl = `${API_URL}/files/${file.id}/download?token=${token}`;

    const renderContent = () => {
        if (file.mimeType.startsWith('image/')) {
            return <img src={fileUrl} alt={file.name} className="max-w-full max-h-[80vh] object-contain" />;
        }
        if (file.mimeType.startsWith('video/')) {
            return (
                <video controls className="max-w-full max-h-[80vh]">
                    <source src={fileUrl} type={file.mimeType} />
                    Your browser does not support the video tag.
                </video>
            );
        }
        if (file.mimeType.startsWith('audio/')) {
            return (
                <div className="flex flex-col items-center justify-center p-10">
                    <Music className="w-24 h-24 text-gray-400 mb-4" />
                    <audio controls className="w-full max-w-md">
                        <source src={fileUrl} type={file.mimeType} />
                        Your browser does not support the audio element.
                    </audio>
                </div>
            );
        }
        if (file.mimeType === 'application/pdf') {
            return <iframe src={fileUrl} className="w-full h-[80vh]" title={file.name} />;
        }

        // Default for unsupported types
        return (
            <div className="flex flex-col items-center justify-center p-10 text-gray-500">
                <FileText className="w-24 h-24 mb-4" />
                <p className="text-lg">Preview not available for this file type.</p>
                <a
                    href={downloadUrl}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
                >
                    <Download className="w-4 h-4" /> Download to view
                </a>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="font-semibold text-lg truncate pr-4">{file.name}</h3>
                    <div className="flex items-center gap-2">
                        <a
                            href={downloadUrl}
                            className="p-2 hover:bg-gray-100 rounded-full text-gray-600"
                            title="Download"
                        >
                            <Download className="w-5 h-5" />
                        </a>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-full text-gray-600"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>
                <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-gray-50">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};
