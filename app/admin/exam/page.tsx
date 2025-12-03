'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import FileUploader from '@/components/board/FileUploader';

interface ExamMaterial {
    id: number;
    title: string;
    attachments: {
        id: number;
        fileName: string;
        fileUrl: string;
        fileSize: number;
        mimeType: string;
    }[];
    createdAt: string;
}

export default function AdminExamPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [materials, setMaterials] = useState<ExamMaterial[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMaterial, setEditingMaterial] = useState<ExamMaterial | null>(null);
    const [title, setTitle] = useState('');
    const [files, setFiles] = useState<File[]>([]);
    const [existingFiles, setExistingFiles] = useState<any[]>([]);

    // Settings State
    const [gridColumns, setGridColumns] = useState(4);

    useEffect(() => {
        fetchMaterials();
        fetchSettings();
    }, [page]);

    const fetchMaterials = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/exam?page=${page}&limit=10`);
            const data = await res.json();
            setMaterials(data.posts || []);
            setTotalPages(data.totalPages || 1);
        } catch (error) {
            console.error('Error fetching materials:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/board-settings/EXAM_USER');
            const data = await res.json();
            if (data.settings) {
                const parsed = JSON.parse(data.settings);
                setGridColumns(parsed.gridColumns || 4);
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
        }
    };

    const handleSaveSettings = async () => {
        try {
            const res = await fetch('/api/board-settings/EXAM_USER', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    settings: JSON.stringify({ gridColumns }),
                }),
            });
            if (res.ok) {
                alert('설정이 저장되었습니다.');
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            alert('설정 저장 중 오류가 발생했습니다.');
        }
    };

    const handleOpenModal = (material?: ExamMaterial) => {
        if (material) {
            setEditingMaterial(material);
            setTitle(material.title);
            setExistingFiles(material.attachments);
            setFiles([]);
        } else {
            setEditingMaterial(null);
            setTitle('');
            setExistingFiles([]);
            setFiles([]);
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim()) {
            alert('제목을 입력해주세요.');
            return;
        }

        if (files.length === 0 && existingFiles.length === 0) {
            alert('파일을 첨부해주세요.');
            return;
        }

        try {
            // 1. Upload new files first
            const uploadedFiles = [...existingFiles];

            for (const file of files) {
                const formData = new FormData();
                formData.append('file', file);

                const uploadRes = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                });

                if (!uploadRes.ok) throw new Error('File upload failed');

                const uploadData = await uploadRes.json();
                uploadedFiles.push({
                    fileName: uploadData.fileName,
                    fileUrl: uploadData.fileUrl,
                    fileSize: uploadData.fileSize,
                    mimeType: uploadData.mimeType,
                });
            }

            // 2. Create or Update Post
            const url = '/api/admin/exam';
            const method = editingMaterial ? 'PUT' : 'POST';
            const body = {
                id: editingMaterial?.id,
                title,
                attachments: uploadedFiles,
            };

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (!res.ok) throw new Error('Failed to save material');

            setIsModalOpen(false);
            fetchMaterials();
            alert(editingMaterial ? '수정되었습니다.' : '등록되었습니다.');
        } catch (error) {
            console.error('Error saving material:', error);
            alert('저장 중 오류가 발생했습니다.');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('정말 삭제하시겠습니까?')) return;

        try {
            const res = await fetch(`/api/admin/exam?id=${id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                fetchMaterials();
            } else {
                alert('삭제 실패');
            }
        } catch (error) {
            console.error('Error deleting material:', error);
            alert('삭제 중 오류가 발생했습니다.');
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">응시자 자료 관리</h1>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    자료 등록
                </button>
            </div>

            {/* Settings Panel */}
            <div className="bg-white p-4 rounded-lg shadow mb-6 border border-gray-200">
                <h2 className="text-lg font-semibold mb-4">화면 설정</h2>
                <div className="flex items-center gap-4">
                    <label className="text-sm font-medium text-gray-700">그리드 열 개수:</label>
                    <select
                        value={gridColumns}
                        onChange={(e) => setGridColumns(Number(e.target.value))}
                        className="border border-gray-300 rounded px-3 py-1.5"
                    >
                        <option value={2}>2열</option>
                        <option value={3}>3열</option>
                        <option value={4}>4열</option>
                        <option value={5}>5열</option>
                    </select>
                    <button
                        onClick={handleSaveSettings}
                        className="bg-gray-800 text-white px-3 py-1.5 rounded text-sm hover:bg-gray-700"
                    >
                        설정 저장
                    </button>
                </div>
            </div>

            {/* List Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">제목</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">첨부파일</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">등록일</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">관리</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">로딩 중...</td>
                            </tr>
                        ) : materials.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">등록된 자료가 없습니다.</td>
                            </tr>
                        ) : (
                            materials.map((material) => (
                                <tr key={material.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{material.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{material.title}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {material.attachments.length > 0 ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {material.attachments[0].fileName}
                                            </span>
                                        ) : '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(material.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleOpenModal(material)}
                                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                                        >
                                            수정
                                        </button>
                                        <button
                                            onClick={() => handleDelete(material.id)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            삭제
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="mt-4 flex justify-center gap-2">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-3 py-1 border rounded disabled:opacity-50"
                    >
                        이전
                    </button>
                    <span className="px-3 py-1">{page} / {totalPages}</span>
                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="px-3 py-1 border rounded disabled:opacity-50"
                    >
                        다음
                    </button>
                </div>
            )}

            {/* Edit/Create Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-lg">
                        <h2 className="text-xl font-bold mb-4">
                            {editingMaterial ? '자료 수정' : '자료 등록'}
                        </h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">제목</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="자료 제목을 입력하세요"
                                    required
                                />
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-1">첨부파일 (PDF, TXT)</label>
                                {existingFiles.length > 0 && (
                                    <div className="mb-2 p-2 bg-gray-50 rounded flex justify-between items-center">
                                        <span className="text-sm text-gray-600 truncate">{existingFiles[0].fileName}</span>
                                        <button
                                            type="button"
                                            onClick={() => setExistingFiles([])}
                                            className="text-red-500 text-sm hover:text-red-700"
                                        >
                                            삭제
                                        </button>
                                    </div>
                                )}
                                {existingFiles.length === 0 && (
                                    <FileUploader
                                        onFilesChange={setFiles}
                                        maxFiles={1}
                                        maxSizeMB={50}
                                    />
                                )}
                                <p className="text-xs text-gray-500 mt-1">
                                    * PDF 또는 TXT 파일만 업로드해주세요.
                                </p>
                            </div>

                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                                >
                                    취소
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    저장
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
