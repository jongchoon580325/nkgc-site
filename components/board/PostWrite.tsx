'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';
import { BoardType, BOARD_CONFIG } from '@/lib/board-config';
import PageHeader from '@/app/components/common/PageHeader';
import FileUploader from './FileUploader';
import TinyMCEEditor from './TinyMCEEditor';

interface PostWriteProps {
    boardType: BoardType;
}

export default function PostWrite({ boardType }: PostWriteProps) {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('');
    const [isNotice, setIsNotice] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [honeypot, setHoneypot] = useState('');
    const [pageLoadTime] = useState(Date.now());
    const [authorName, setAuthorName] = useState(''); // 작성자 이름

    const router = useRouter();
    const searchParams = useSearchParams();
    const { data: session, status } = useSession();

    const config = BOARD_CONFIG[boardType];
    const userRole = session?.user?.role;
    const isAdmin = userRole === 'admin' || userRole === 'ADMIN';

    // Get returnUrl from query params
    const returnUrl = searchParams.get('returnUrl');

    useEffect(() => {
        // Fetch categories for this board
        fetchCategories();

        // Set default author name
        if (session?.user) {
            setAuthorName(isAdmin ? '관리자' : session.user.name || '');
        }
    }, [boardType, session, isAdmin]);

    const fetchCategories = async () => {
        try {
            const res = await fetch(`/api/board-settings/${boardType}`);
            const data = await res.json();
            setCategories(data.categories || []);

            // Set default category if available
            if (data.categories && data.categories.length > 0) {
                setCategory(data.categories[0]);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const handleFilesChange = (selectedFiles: File[]) => {
        setFiles(selectedFiles);
    };

    const uploadFiles = async (): Promise<any[]> => {
        const uploadedFiles = [];

        for (const file of files) {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) throw new Error('File upload failed');

            const data = await res.json();
            uploadedFiles.push(data);
        }

        return uploadedFiles;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!title.trim() || !content.trim()) {
            alert('제목과 내용을 입력해주세요.');
            return;
        }

        // Spam check
        if (honeypot) return; // Bot detected
        const elapsedTime = Date.now() - pageLoadTime;
        if (elapsedTime < 3000) {
            alert('너무 빨리 제출되었습니다. 잠시 후 다시 시도해주세요.');
            return;
        }

        setSubmitting(true);

        try {
            // 1. Upload files first
            const uploadedAttachments = await uploadFiles();

            // 2. Create post
            const res = await fetch('/api/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    content,
                    boardType,
                    category,
                    isNotice,
                    attachments: uploadedAttachments,
                    authorName, // 작성자 이름 추가
                }),
            });

            if (res.ok) {
                // Use returnUrl if provided, otherwise default to board page
                const redirectUrl = returnUrl || `/board/${boardType}`;
                router.push(redirectUrl);
                router.refresh();
            } else {
                const data = await res.json();
                alert(data.error || '글 작성에 실패했습니다.');
            }
        } catch (error) {
            console.error('Error creating post:', error);
            alert('오류가 발생했습니다.');
        } finally {
            setSubmitting(false);
        }
    };

    if (status === 'loading') {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (status === 'unauthenticated') {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center py-12">
                    <p className="text-gray-600">로그인이 필요합니다.</p>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50">
            <PageHeader title={`${config.title} - 글쓰기`} />

            <div className="container mx-auto px-6 py-12">
                <div className="bg-white rounded-2xl shadow-lg p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Honeypot (hidden) */}
                        <input
                            type="text"
                            name="website"
                            value={honeypot}
                            onChange={(e) => setHoneypot(e.target.value)}
                            style={{ display: 'none' }}
                            tabIndex={-1}
                            autoComplete="off"
                        />

                        {/* 공지사항 & 카테고리 */}
                        <div className="flex flex-wrap gap-4 items-center">
                            {/* 공지사항 체크박스 (관리자만) */}
                            {isAdmin && (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="isNotice"
                                        checked={isNotice}
                                        onChange={(e) => setIsNotice(e.target.checked)}
                                        className="w-4 h-4"
                                    />
                                    <label htmlFor="isNotice" className="text-sm font-semibold">
                                        공지사항
                                    </label>
                                </div>
                            )}

                            {/* 카테고리 선택 */}
                            {categories.length > 0 && (
                                <div className="flex items-center gap-2">
                                    <label htmlFor="category" className="text-sm font-medium">
                                        카테고리
                                    </label>
                                    <select
                                        id="category"
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="border border-gray-300 rounded px-3 py-1 text-sm"
                                    >
                                        {categories.map((cat) => (
                                            <option key={cat} value={cat}>
                                                {cat}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>

                        {/* 작성자 */}
                        <div>
                            <label htmlFor="authorName" className="block text-sm font-medium mb-2">
                                작성자 <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="authorName"
                                value={authorName}
                                onChange={(e) => setAuthorName(e.target.value)}
                                readOnly={!isAdmin}
                                className={`w-full border border-gray-300 rounded-lg px-4 py-2 ${!isAdmin ? 'bg-gray-100 cursor-not-allowed' : ''
                                    }`}
                                placeholder="작성자 이름"
                                required
                            />
                            {!isAdmin && (
                                <p className="text-xs text-gray-500 mt-1">
                                    작성자 이름은 로그인한 사용자 이름으로 자동 설정됩니다.
                                </p>
                            )}
                            {isAdmin && (
                                <p className="text-xs text-gray-500 mt-1">
                                    관리자는 작성자 이름을 직접 입력할 수 있습니다.
                                </p>
                            )}
                        </div>

                        {/* 제목 */}
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium mb-2">
                                제목 <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                                placeholder="제목을 입력하세요"
                                required
                            />
                        </div>

                        {/* 내용 */}
                        <div>
                            <label htmlFor="content" className="block text-sm font-medium mb-2">
                                내용 <span className="text-red-500">*</span>
                            </label>
                            <TinyMCEEditor
                                value={content}
                                onChange={setContent}
                                placeholder="내용을 입력하세요"
                            />
                        </div>

                        {/* 첨부파일 */}
                        <FileUploader onFilesChange={handleFilesChange} />

                        {/* 버튼 */}
                        <div className="flex gap-2 justify-end pt-4">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
                            >
                                취소
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                {submitting ? '작성 중...' : '작성하기'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    );
}
