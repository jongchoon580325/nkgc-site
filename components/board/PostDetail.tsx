'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { BoardType, BOARD_CONFIG } from '@/lib/board-config';
import PageHeader from '@/app/components/common/PageHeader';

interface Post {
    id: number;
    title: string;
    content: string;
    boardType: string;
    viewCount: number;
    isNotice: boolean;
    createdAt: string;
    updatedAt: string;
    author: {
        id: number;
        username: string;
        name: string;
        churchName: string;
    };
    authorName?: string | null; // 작성자 이름 (직접 입력)
    comments: Comment[];
    attachments: Attachment[];
    _count: {
        likes: number;
    };
}

interface Comment {
    id: number;
    content: string;
    createdAt: string;
    author: {
        id: number;
        username: string;
        name: string;
    };
}

interface Attachment {
    id: number;
    fileName: string;
    fileUrl: string;
    fileSize: number;
}

interface PostDetailProps {
    boardType: BoardType;
    postId: string;
}

export default function PostDetail({ boardType, postId }: PostDetailProps) {
    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const searchParams = useSearchParams();
    const { data: session } = useSession();

    const from = searchParams.get('from');
    const listLink = from === 'admin' ? '/admin/gallery-settings' : `/board/${boardType}`;

    const config = BOARD_CONFIG[boardType];

    useEffect(() => {
        fetchPost();
    }, [postId]);

    const fetchPost = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/posts/${postId}`);
            const data = await res.json();
            setPost(data);
        } catch (error) {
            console.error('Error fetching post:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('정말 삭제하시겠습니까?')) return;

        try {
            const res = await fetch(`/api/posts/${postId}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                alert('삭제되었습니다.');
                router.push(`/board/${boardType}`);
            } else {
                const data = await res.json();
                alert(data.error || '삭제 실패');
            }
        } catch (error) {
            console.error('Error deleting post:', error);
            alert('삭제 중 오류가 발생했습니다.');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="text-gray-500">로딩 중...</div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="text-gray-500">게시글을 찾을 수 없습니다.</div>
            </div>
        );
    }

    const canEdit = session?.user?.id === post.author.id.toString() || (session?.user?.role === 'admin' || session?.user?.role === 'ADMIN');

    return (
        <main className="min-h-screen bg-gray-50">
            <PageHeader title={config.title} />

            {/* Content Section */}
            <div className="container mx-auto px-6 py-12">
                <div className="bg-white rounded-2xl shadow-lg p-8">
                    {/* 게시글 정보 */}
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                            <h2 className="text-xl font-semibold mb-2">
                                {post.isNotice && (
                                    <span className="text-red-600 mr-2">[공지]</span>
                                )}
                                {post.title}
                            </h2>
                            <div className="flex gap-4 text-sm text-gray-600">
                                <span>{post.authorName || post.author.name} ({post.author.churchName})</span>
                                <span>조회 {post.viewCount}</span>
                                <span>{new Date(post.createdAt).toLocaleString()}</span>
                            </div>
                        </div>

                        {/* 본문 */}
                        <div className="px-6 py-6">
                            <div
                                className="post-content"
                                dangerouslySetInnerHTML={{ __html: post.content }}
                            />
                            <style jsx>{`
                                .post-content table {
                                    border-collapse: collapse;
                                    width: 100%;
                                    border: 1px solid #888;
                                    margin: 1em 0;
                                }
                                .post-content th,
                                .post-content td {
                                    border: 1px solid #888;
                                    padding: 8px 12px;
                                    text-align: left;
                                }
                                .post-content th {
                                    background-color: #f0f0f0;
                                    font-weight: 600;
                                }
                                .post-content img {
                                    max-width: 100%;
                                    height: auto;
                                }
                                .post-content iframe {
                                    max-width: 100%;
                                }
                            `}</style>
                        </div>

                        {/* 첨부파일 */}
                        {post.attachments.length > 0 && (
                            <div className="border-t border-gray-200 px-6 py-4">
                                <h3 className="font-semibold mb-2">첨부파일</h3>
                                <ul className="space-y-1">
                                    {post.attachments.map((file) => (
                                        <li key={file.id}>
                                            <a
                                                href={`/api/attachments/${file.id}`}
                                                download={file.fileName}
                                                className="text-blue-600 hover:underline"
                                            >
                                                {file.fileName} ({(file.fileSize / 1024).toFixed(1)} KB)
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* 버튼 */}
                        <div className="border-t border-gray-200 px-6 py-4 flex gap-2 justify-end">
                            <Link
                                href={listLink}
                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                            >
                                목록보기
                            </Link>
                            {canEdit && (
                                <>
                                    <Link
                                        href={`/board/${boardType}/edit/${postId}`}
                                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                                    >
                                        수정
                                    </Link>
                                    <button
                                        onClick={handleDelete}
                                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                                    >
                                        삭제
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* 댓글 섹션 */}
                    {config.canComment && (
                        <div className="mt-6">
                            <h3 className="text-lg font-semibold mb-4">
                                댓글 ({post.comments.length})
                            </h3>
                            <div className="space-y-4">
                                {post.comments.map((comment) => (
                                    <div
                                        key={comment.id}
                                        className="border border-gray-200 rounded-lg p-4"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-semibold">{comment.author.name}</span>
                                            <span className="text-sm text-gray-500">
                                                {new Date(comment.createdAt).toLocaleString()}
                                            </span>
                                        </div>
                                        <p className="text-gray-700">{comment.content}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
