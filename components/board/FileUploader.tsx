'use client';

import { useState } from 'react';

interface FileUploaderProps {
    onFilesChange: (files: File[]) => void;
    maxFiles?: number;
    maxSizeMB?: number;
}

export default function FileUploader({
    onFilesChange,
    maxFiles = 10,
    maxSizeMB = 50,
}: FileUploaderProps) {
    const [files, setFiles] = useState<File[]>([]);
    const [error, setError] = useState('');

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        setError('');
        const selectedFiles = Array.from(e.target.files || []);

        // Validate max files
        if (files.length + selectedFiles.length > maxFiles) {
            setError(`최대 ${maxFiles}개 파일까지 업로드 가능합니다.`);
            return;
        }

        // Validate file size
        const maxSizeBytes = maxSizeMB * 1024 * 1024;
        const invalidFiles = selectedFiles.filter(f => f.size > maxSizeBytes);
        if (invalidFiles.length > 0) {
            setError(`파일 크기는 ${maxSizeMB}MB를 초과할 수 없습니다.`);
            return;
        }

        const newFiles = [...files, ...selectedFiles];
        setFiles(newFiles);
        onFilesChange(newFiles);

        // Reset input
        e.target.value = '';
    };

    const handleRemoveFile = (index: number) => {
        const newFiles = files.filter((_, i) => i !== index);
        setFiles(newFiles);
        onFilesChange(newFiles);
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    return (
        <div>
            <label className="block text-sm font-medium mb-2">첨부파일</label>

            {/* File Input */}
            <div className="mb-3">
                <input
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-lg file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100
                        cursor-pointer"
                    disabled={files.length >= maxFiles}
                />
                <p className="text-xs text-gray-500 mt-1">
                    최대 {maxFiles}개, 개당 {maxSizeMB}MB 이하
                </p>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                    {error}
                </div>
            )}

            {/* File List */}
            {files.length > 0 && (
                <div className="space-y-2">
                    {files.map((file, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                        >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <svg
                                    className="w-5 h-5 text-gray-400 flex-shrink-0"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    />
                                </svg>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        {file.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {formatFileSize(file.size)}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => handleRemoveFile(index)}
                                className="ml-3 text-red-600 hover:text-red-800 font-bold text-lg flex-shrink-0"
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
