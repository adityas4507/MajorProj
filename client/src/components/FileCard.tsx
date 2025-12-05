import { format } from 'date-fns';
import { Download, Eye, File as FileIcon, FileText, Image, MoreVertical, Music, Trash2, Video } from 'lucide-react';
import React from 'react';
import type { File } from '../api/types';
import { FilePreviewModal } from './FilePreviewModal';

interface FileProps {
    file: File;
    onDownload: (file: File) => void;
    onDelete: (file: File) => void;
}

export const FileCard: React.FC<FileProps> = ({ file, onDownload, onDelete }) => {
    const [showMenu, setShowMenu] = React.useState(false);
    const [showPreview, setShowPreview] = React.useState(false);
    const menuRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getIcon = (mimeType: string) => {
        if (mimeType.startsWith('image/')) return <Image className="w-8 h-8 text-purple-500" />;
        if (mimeType.startsWith('video/')) return <Video className="w-8 h-8 text-red-500" />;
        if (mimeType.startsWith('audio/')) return <Music className="w-8 h-8 text-yellow-500" />;
        if (mimeType.includes('pdf')) return <FileText className="w-8 h-8 text-red-400" />;
        return <FileIcon className="w-8 h-8 text-blue-500" />;
    };

    const formatSize = (bytes: string) => {
        const b = Number(bytes);
        if (b < 1024) return b + ' B';
        if (b < 1024 * 1024) return (b / 1024).toFixed(1) + ' KB';
        return (b / (1024 * 1024)).toFixed(1) + ' MB';
    };

    return (
        <>
            <div className="bg-white rounded-xl border border-gray-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 p-4 relative group">
                <div className="flex items-start justify-between mb-4">
                    <div
                        className="p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-blue-50 transition-colors"
                        onClick={() => setShowPreview(true)}
                    >
                        {getIcon(file.mimeType)}
                    </div>
                    <div className="relative" ref={menuRef}>
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            className="p-1.5 hover:bg-gray-100 rounded-full opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                        >
                            <MoreVertical className="w-5 h-5 text-gray-500" />
                        </button>

                        {showMenu && (
                            <div className="absolute right-0 top-8 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-10 py-1 overflow-hidden">
                                <button
                                    onClick={() => { setShowPreview(true); setShowMenu(false); }}
                                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                >
                                    <Eye className="w-4 h-4" /> Preview
                                </button>
                                <button
                                    onClick={() => { onDownload(file); setShowMenu(false); }}
                                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                >
                                    <Download className="w-4 h-4" /> Download
                                </button>
                                <button
                                    onClick={() => { onDelete(file); setShowMenu(false); }}
                                    className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                >
                                    <Trash2 className="w-4 h-4" /> Delete
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <h3
                    className="font-medium text-gray-700 truncate mb-1 cursor-pointer hover:text-primary transition-colors"
                    title={file.name}
                    onClick={() => setShowPreview(true)}
                >
                    {file.name}
                </h3>
                <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{formatSize(file.sizeBytes)}</span>
                    <span>{format(new Date(file.updatedAt), 'MMM d, yyyy')}</span>
                </div>
            </div>

            {showPreview && (
                <FilePreviewModal
                    file={file}
                    onClose={() => setShowPreview(false)}
                />
            )}
        </>
    );
};
