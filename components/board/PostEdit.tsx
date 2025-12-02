'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';
import { BoardType, BOARD_CONFIG } from '@/lib/board-config';
import PageHeader from '@/app/components/common/PageHeader';
import FileUploader from './FileUploader';
import QuillEditor from './QuillEditor';

// ReactQuill dynamic import for SSR prevention
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });
import 'react-quill-new/dist/quill.snow.css';

interface PostEditProps {
    boardType: BoardType;
    postId: string;
}

interface Attachment {
    id: number;
    fileName: string;
    fileUrl: string;
    fileSize: number;
}

export default function PostEdit({ boardType, postId }: PostEditProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { data: session, status } = useSession();
    const config = BOARD_CONFIG[boardType];

    // Get returnUrl from query params
    const returnUrl = searchParams.get('returnUrl');

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isNotice, setIsNotice] = useState(false);
    const [category, setCategory] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [authorName, setAuthorName] = useState(''); // 작성자 이름

    // File handling
    const [existingAttachments, setExistingAttachments] = useState<Attachment[]>([]);
    const [deletedFileIds, setDeletedFileIds] = useState<number[]>([]);
    const [newFiles, setNewFiles] = useState<File[]>([]);

    useEffect(() => {
        if (status === 'unauthenticated') {
            alert('로그인이 필요합니다.');
            router.push('/login');
            return;
        }
        if (status === 'authenticated') {
            fetchPost();
        }
    }, [status, postId]);

    const fetchPost = async () => {
        try {
            const res = await fetch(`/api/posts/${postId}`);
            const data = await res.json();

            if (!res.ok) throw new Error(data.error);

            // 권한 체크
            const isAuthor = session?.user?.id === data.author.id.toString();
            const isAdmin = session?.user?.role === 'admin' || session?.user?.role === 'ADMIN';

            if (!isAuthor && !isAdmin) {
                alert('수정 권한이 없습니다.');
                router.back();
                return;
            }

            setTitle(data.title);
            setContent(data.content);
            setIsNotice(data.isNotice);
            setCategory(data.category || '');
            setAuthorName(data.authorName || data.author.name || ''); // authorName 우선, 없으면 author.name
            setExistingAttachments(data.attachments);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching post:', error);
            alert('게시글을 불러오는 중 오류가 발생했습니다.');
            router.back();
        }
    };

    const handleDeleteExistingFile = (fileId: number) => {
        if (!confirm('이 파일을 삭제하시겠습니까? (저장 시 반영됩니다)')) return;
        setDeletedFileIds([...deletedFileIds, fileId]);
        setExistingAttachments(existingAttachments.filter(f => f.id !== fileId));
    };

    const uploadFiles = async () => {
        if (newFiles.length === 0) return [];

        const formData = new FormData();
        newFiles.forEach((file) => {
            formData.append('files', file);
        });

        const res = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
        });

        if (!res.ok) {
            throw new Error('파일 업로드 실패');
        }

        const data = await res.json();
        return data.files; // [{ fileName, fileUrl, fileSize, mimeType }]
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) {
            alert('제목과 내용을 입력해주세요.');
            return;
        }

        if (config.categories && config.categories.length > 0 && !category) {
            alert('카테고리를 선택해주세요.');
            return;
        }

        if (!confirm('수정하시겠습니까?')) return;

        setSubmitting(true);

        try {
            // 1. Upload new files first
            const uploadedFiles = await uploadFiles();

            // 2. Update post
            const res = await fetch(`/api/posts/${postId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title,
                    content,
                    isNotice,
                    category,
                    newAttachments: uploadedFiles,
                    deletedFileIds,
                    authorName, // 작성자 이름 추가
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || '게시글 수정 실패');
            }

            alert('게시글이 수정되었습니다.');
            // Use returnUrl if provided, otherwise default to post detail page
            const redirectUrl = returnUrl || `/board/${boardType}/${postId}`;
            router.push(redirectUrl);
        } catch (error) {
            console.error('Error updating post:', error);
            alert(error instanceof Error ? error.message : '게시글 수정 중 오류가 발생했습니다.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center">로딩 중...</div>;
    }

    const isAdmin = session?.user?.role === 'admin' || session?.user?.role === 'ADMIN';
    const categories = config.categories || [];

    return (
        <main className="min-h-screen bg-gray-50">
            <PageHeader title={`${config.title} 수정`} />

            <div className="container mx-auto px-6 py-12">
                <div className="bg-white rounded-2xl shadow-lg p-8 max-w-4xl mx-auto">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Category & Notice */}
                        <div className="flex gap-4">
                            {categories.length > 0 && (
                                <div className="w-1/3">
                                    <label className="block text-sm font-medium mb-2">카테고리</label>
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="">선택하세요</option>
                                        {categories.map((cat) => (
                                            <option key={cat} value={cat}>
                                                {cat}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {isAdmin && (
                                <div className="flex items-center mt-7">
                                    <input
                                        type="checkbox"
                                        id="isNotice"
                                        checked={isNotice}
                                        onChange={(e) => setIsNotice(e.target.checked)}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <label htmlFor="isNotice" className="ml-2 text-sm font-medium text-gray-700">
                                        공지사항으로 등록
                                    </label>
                                </div>
                            )}
                        </div>

                        {/* Author Name (Admin Only) */}
                        {isAdmin && (
                            <div>
                                <label className="block text-sm font-medium mb-2">작성자</label>
                                <input
                                    type="text"
                                    value={authorName}
                                    onChange={(e) => setAuthorName(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="작성자 이름"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    관리자는 작성자 이름을 수정할 수 있습니다.
                                </p>
                            </div>
                        )}

                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium mb-2">제목</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="제목을 입력하세요"
                            />
                        </div>

                        {/* Content */}
                        <div>
                            <label className="block text-sm font-medium mb-2">내용</label>
                            <div className="h-96 mb-12">
                                <QuillEditor
                                    value={content}
                                    onChange={setContent}
                                    className="h-full"
                                />
                            </div>
                        </div>

                        {/* Existing Files */}
                        {existingAttachments.length > 0 && (
                            <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <h3 className="text-sm font-medium mb-3">기존 첨부파일</h3>
                                <ul className="space-y-2">
                                    {existingAttachments.map((file) => (
                                        <li key={file.id} className="flex items-center justify-between text-sm">
                                            <div className="flex items-center text-gray-700">
                                                <span className="mr-2">📎</span>
                                                {file.fileName} ({(file.fileSize / 1024).toFixed(1)} KB)
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteExistingFile(file.id)}
                                                className="text-red-500 hover:text-red-700 text-xs px-2 py-1 border border-red-200 rounded hover:bg-red-50"
                                            >
                                                삭제
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* New File Upload */}
                        <div className="mt-6">
                            <FileUploader onFilesChange={setNewFiles} />
                        </div>

                        {/* Buttons */}
                        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                취소
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
                            >
                                {submitting ? '저장 중...' : '수정하기'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    );
}
