'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface VideoPost {
    id: number;
    title: string;
    content: string;
    viewCount: number;
    createdAt: string;
    author: {
        name: string;
    };
    authorName?: string | null;
    _count: {
        comments: number;
    };
    attachments: {
        id: number;
        fileName: string;
        fileUrl: string;
    }[];
}

export default function VideoSettingsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [posts, setPosts] = useState<VideoPost[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 20;

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
            return;
        }

        if (status === 'authenticated') {
            const isAdmin = session.user?.role === 'admin' || session.user?.role === 'ADMIN';
            if (!isAdmin) {
                alert('관리자 권한이 필요합니다.');
                router.push('/admin');
                return;
            }
            fetchPosts();
        }
    }, [status, page]);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/posts?type=VIDEO&page=${page}&limit=${limit}`);
            const data = await res.json();
            setPosts(data.posts || []);
            setTotalPages(data.totalPages || 1);
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeletePost = async (postId: number) => {
        if (!confirm('정말 삭제하시겠습니까?')) return;

        try {
            const res = await fetch(`/api/posts/${postId}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                alert('삭제되었습니다.');
                fetchPosts();
            } else {
                const data = await res.json();
                alert(data.error || '삭제 실패');
            }
        } catch (error) {
            console.error('Error deleting post:', error);
            alert('삭제 중 오류가 발생했습니다.');
        }
    };

    if (status === 'loading' || loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-gray-500">로딩 중...</div>
            </div>
        );
    }

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">영상자료실 관리</h1>

            {/* Posts Management */}
            <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">게시글 관리 ({posts.length}개)</h2>
                    <Link
                        href="/board/VIDEO/write?returnUrl=/admin/video-settings"
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                        새 게시글 작성
                    </Link>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left">번호</th>
                                <th className="px-4 py-2 text-left">제목</th>
                                <th className="px-4 py-2 text-left">작성자</th>
                                <th className="px-4 py-2 text-center">작성일</th>
                                <th className="px-4 py-2 text-center">관리</th>
                            </tr>
                        </thead>
                        <tbody>
                            {posts.map((post, index) => (
                                <tr key={post.id} className="border-b hover:bg-gray-50">
                                    <td className="px-4 py-3">{(page - 1) * limit + index + 1}</td>
                                    <td className="px-4 py-3">
                                        <Link
                                            href={`/board/VIDEO/${post.id}?from=admin`}
                                            className="text-blue-600 hover:underline"
                                        >
                                            {post.title}
                                        </Link>
                                    </td>
                                    <td className="px-4 py-3">{post.authorName || post.author.name}</td>
                                    <td className="px-4 py-3 text-center text-sm text-gray-600">
                                        {new Date(post.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="flex justify-center gap-2">
                                            <Link
                                                href={`/board/VIDEO/edit/${post.id}?returnUrl=/admin/video-settings`}
                                                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                                            >
                                                수정
                                            </Link>
                                            <button
                                                onClick={() => handleDeletePost(post.id)}
                                                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                                            >
                                                삭제
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="mt-6 flex justify-center items-center gap-2">
                        <button
                            onClick={() => setPage(1)}
                            disabled={page === 1}
                            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            처음으로
                        </button>
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            이전
                        </button>
                        <div className="px-6 py-2 border border-gray-300 rounded-md bg-white text-gray-900 font-semibold min-w-[100px] text-center">
                            {page} / {totalPages}
                        </div>
                        <button
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            다음
                        </button>
                        <button
                            onClick={() => setPage(totalPages)}
                            disabled={page === totalPages}
                            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            마지막
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
