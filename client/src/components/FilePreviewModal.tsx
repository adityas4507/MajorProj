import { Download, FileText, Music, X, AlertCircle } from "lucide-react";
import React from "react";
import { API_URL } from "../api/client";
import type { File } from "../api/types";

interface FilePreviewModalProps {
    file: File;
    onClose: () => void;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
    file,
    onClose,
}) => {
    const token = localStorage.getItem("accessToken");

    const fileUrl = React.useMemo(() => {
        if (!token) return "";
        return `${API_URL}/files/${file.id}/view?token=${encodeURIComponent(
            token
        )}`;
    }, [file.id, token]);

    const downloadUrl = React.useMemo(() => {
        if (!token) return "";
        return `${API_URL}/files/${file.id}/download?token=${encodeURIComponent(
            token
        )}`;
    }, [file.id, token]);

    const [hasError, setHasError] = React.useState(false);

    const renderContent = () => {
        if (!fileUrl) {
            return <p className="text-gray-500">Not authenticated</p>;
        }

        if (hasError) {
            return (
                <div className="flex flex-col items-center justify-center p-10 text-gray-500">
                    <AlertCircle className="w-16 h-16 mb-4" />
                    <p className="text-lg mb-4">Preview failed to load</p>
                    <a
                        href={downloadUrl}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
                    >
                        <Download className="w-4 h-4" /> Download instead
                    </a>
                </div>
            );
        }

        if (file.mimeType.startsWith("image/")) {
            return (
                <img
                    src={fileUrl}
                    alt={file.name}
                    className="max-w-full max-h-[80vh] object-contain"
                    onError={() => setHasError(true)}
                />
            );
        }

        if (file.mimeType.startsWith("video/")) {
            return (
                <video
                    controls
                    className="max-w-full max-h-[80vh]"
                    onError={() => setHasError(true)}
                >
                    <source src={fileUrl} type={file.mimeType} />
                    Your browser does not support the video tag.
                </video>
            );
        }

        if (file.mimeType.startsWith("audio/")) {
            return (
                <div className="flex flex-col items-center justify-center p-10">
                    <Music className="w-24 h-24 text-gray-400 mb-4" />
                    <audio
                        controls
                        className="w-full max-w-md"
                        onError={() => setHasError(true)}
                    >
                        <source src={fileUrl} type={file.mimeType} />
                        Your browser does not support the audio element.
                    </audio>
                </div>
            );
        }

        if (file.mimeType === "application/pdf") {
            return (
                <iframe
                    src={fileUrl}
                    className="w-full h-[80vh]"
                    title={file.name}
                    onError={() => setHasError(true)}
                />
            );
        }

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
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b dark:border-gray-800">
                    <h3 className="font-semibold text-lg truncate pr-4 text-gray-900 dark:text-white">
                        {file.name}
                    </h3>
                    <div className="flex items-center gap-2">
                        <a
                            href={downloadUrl}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-600 dark:text-gray-400"
                            title="Download"
                        >
                            <Download className="w-5 h-5" />
                        </a>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-600 dark:text-gray-400"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-gray-50 dark:bg-black/50">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};
