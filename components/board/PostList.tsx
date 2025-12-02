'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { BoardType, BOARD_CONFIG } from '@/lib/board-config';
import PageHeader from '@/app/components/common/PageHeader';

interface Post {
    id: number;
    title: string;
    content: string;
    boardType: string;
    category: string | null;
    viewCount: number;
    isNotice: boolean;
    createdAt: string;
    author: {
        username: string;
        name: string;
        churchName: string;
    };
    authorName?: string | null; // 작성자 이름 (직접 입력)
    _count: {
        comments: number;
    };
}

interface PostListProps {
    boardType: BoardType;
    showHeader?: boolean;
}

export default function PostList({ boardType, showHeader = true }: PostListProps) {
    const [posts, setPosts] = useState<Post[]>([]);
    const [allPosts, setAllPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [searchInput, setSearchInput] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('전체');
    const [categories, setCategories] = useState<string[]>([]);

    const config = BOARD_CONFIG[boardType];

    useEffect(() => {
        fetchPosts();
        fetchCategories();
    }, [boardType]);

    const fetchCategories = async () => {
        try {
            const res = await fetch(`/api/board-settings/${boardType}`);
            const data = await res.json();
            setCategories(data.categories || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                type: boardType,
                page: '1',
                limit: '1000', // Get all for client-side filtering
            });

            const res = await fetch(`/api/posts?${params}`);
            const data = await res.json();

            setAllPosts(data.posts || []);
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setLoading(false);
        }
    };

    // Real-time search and filtering
    const filteredPosts = useMemo(() => {
        let filtered = allPosts;

        // Category filter
        if (selectedCategory !== '전체') {
            filtered = filtered.filter(post => post.category === selectedCategory);
        }

        // Search filter (real-time)
        if (searchInput.trim()) {
            const searchLower = searchInput.toLowerCase();
            filtered = filtered.filter(post =>
                post.title.toLowerCase().includes(searchLower) ||
                post.content.toLowerCase().includes(searchLower)
            );
        }

        return filtered;
    }, [allPosts, searchInput, selectedCategory]);

    // Pagination
    const postsPerPage = 20;
    const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
    const paginatedPosts = filteredPosts.slice((page - 1) * postsPerPage, page * postsPerPage);

    // Reset page when filters change
    useEffect(() => {
        setPage(1);
    }, [searchInput, selectedCategory]);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="text-gray-500">로딩 중...</div>
            </div>
        );
    }

    const renderContent = () => (
        <>
            {/* 카테고리 필터 */}
            {categories.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                    <button
                        onClick={() => setSelectedCategory('전체')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${selectedCategory === '전체'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        전체
                    </button>
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${selectedCategory === category
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            )}

            {/* 검색바 - 실시간 검색 */}
            <div className="mb-6 flex justify-between items-center">
                <div className="flex-1 max-w-md">
                    <input
                        type="text"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="검색어 입력 시 자동 검색..."
                        className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    />
                    {searchInput && (
                        <p className="text-sm text-gray-500 mt-1">
                            {filteredPosts.length}개의 게시글이 검색되었습니다.
                        </p>
                    )}
                </div>

                <Link
                    href={`/board/${boardType}/write`}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
                >
                    글쓰기
                </Link>
            </div>

            {/* 게시글 목록 테이블 (조회 컬럼 삭제됨) */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 w-16">번호</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">제목</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 w-32">작성자</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 w-32">작성일</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {paginatedPosts.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                                    게시글이 없습니다.
                                </td>
                            </tr>
                        ) : (
                            paginatedPosts.map((post) => (
                                <tr
                                    key={post.id}
                                    className={`hover:bg-gray-50 ${post.isNotice ? 'bg-yellow-50' : ''}`}
                                >
                                    <td className="px-4 py-3 text-sm text-gray-700">
                                        {post.isNotice ? (
                                            <span className="text-red-600 font-semibold">공지</span>
                                        ) : (
                                            post.id
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <Link
                                            href={`/board/${boardType}/${post.id}`}
                                            className="text-blue-600 hover:underline"
                                        >
                                            {post.category && (
                                                <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-2">
                                                    {post.category}
                                                </span>
                                            )}
                                            {post.title}
                                            {post._count.comments > 0 && (
                                                <span className="text-red-500 ml-1">
                                                    [{post._count.comments}]
                                                </span>
                                            )}
                                        </Link>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-700">
                                        {post.authorName || post.author.name}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">
                                        {new Date(post.createdAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Action Buttons Group */}
            <div className="mt-6 flex justify-end gap-3">
                {/* Back to Main Exam Page Button (only for EXAM_DEPT and EXAM_USER) */}
                {(boardType === 'EXAM_DEPT' || boardType === 'EXAM_USER') && (
                    <Link
                        href="/board/exam"
                        className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-md flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        고시부 전체자료실로 가기
                    </Link>
                )}

                {/* Write Button */}
                {config.canWrite && (
                    <Link
                        href={`/board/${boardType}/write`}
                        className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-md flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        글쓰기
                    </Link>
                )}
            </div>

            {/* 페이지네이션 */}
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
        </>
    );

    if (!showHeader) {
        return renderContent();
    }

    return (
        <main className="min-h-screen bg-gray-50">
            <PageHeader title={config.title} />

            <div className="container mx-auto px-6 py-12">
                <div className="bg-white rounded-2xl shadow-lg p-8">
                    {renderContent()}
                </div>
            </div>
        </main>
    );
}
