'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface GalleryPost {
    id: number;
    title: string;
    content: string;
    viewCount: number;
    createdAt: string;
    author: {
        name: string;
    };
    _count: {
        comments: number;
    };
    attachments: {
        id: number;
        fileName: string;
        fileUrl: string;
    }[];
}

interface GallerySettings {
    gridColumns: number;
    gridRows: number;
    showTitle: boolean;
    showDate: boolean;
    showAuthor: boolean;
    homeEnabled: boolean;
    homeCount: number;
}

const DEFAULT_SETTINGS: GallerySettings = {
    gridColumns: 4,
    gridRows: 3,
    showTitle: true,
    showDate: true,
    showAuthor: true,
    homeEnabled: true,
    homeCount: 6,
};

export default function GallerySettingsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [settings, setSettings] = useState<GallerySettings>(DEFAULT_SETTINGS);
    const [posts, setPosts] = useState<GalleryPost[]>([]);
    const [saving, setSaving] = useState(false);

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
            fetchSettings();
            fetchPosts();
        }
    }, [status]);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/board-settings/GALLERY');
            const data = await res.json();

            if (res.ok && data.settings) {
                const parsed = JSON.parse(data.settings);
                setSettings({ ...DEFAULT_SETTINGS, ...parsed });
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
        }
    };

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/posts?type=GALLERY&page=1&limit=1000');
            const data = await res.json();
            setPosts(data.posts || []);
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveSettings = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/board-settings/GALLERY', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    settings: JSON.stringify(settings),
                }),
            });

            if (res.ok) {
                alert('설정이 저장되었습니다.');
            } else {
                const data = await res.json();
                alert(data.error || '저장 실패');
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            alert('저장 중 오류가 발생했습니다.');
        } finally {
            setSaving(false);
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
            <h1 className="text-3xl font-bold mb-6">사진자료실 관리</h1>

            {/* Settings Section */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">갤러리 설정</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Grid Settings */}
                    <div>
                        <h3 className="font-semibold mb-3 text-gray-700">그리드 레이아웃</h3>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium mb-1">열 개수</label>
                                <input
                                    type="number"
                                    min="3"
                                    max="6"
                                    value={settings.gridColumns}
                                    onChange={(e) => setSettings({ ...settings, gridColumns: parseInt(e.target.value) })}
                                    className="w-full p-2 border border-gray-300 rounded"
                                />
                                <p className="text-xs text-gray-500 mt-1">3-6 사이의 값 (권장: 4)</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">페이지당 행 개수</label>
                                <input
                                    type="number"
                                    min="2"
                                    max="5"
                                    value={settings.gridRows}
                                    onChange={(e) => setSettings({ ...settings, gridRows: parseInt(e.target.value) })}
                                    className="w-full p-2 border border-gray-300 rounded"
                                />
                                <p className="text-xs text-gray-500 mt-1">2-5 사이의 값 (권장: 3)</p>
                            </div>
                        </div>
                    </div>

                    {/* Display Options */}
                    <div>
                        <h3 className="font-semibold mb-3 text-gray-700">표시 옵션</h3>
                        <div className="space-y-2">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={settings.showTitle}
                                    onChange={(e) => setSettings({ ...settings, showTitle: e.target.checked })}
                                    className="mr-2"
                                />
                                <span className="text-sm">제목 표시</span>
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={settings.showDate}
                                    onChange={(e) => setSettings({ ...settings, showDate: e.target.checked })}
                                    className="mr-2"
                                />
                                <span className="text-sm">날짜 표시</span>
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={settings.showAuthor}
                                    onChange={(e) => setSettings({ ...settings, showAuthor: e.target.checked })}
                                    className="mr-2"
                                />
                                <span className="text-sm">작성자 표시</span>
                            </label>
                        </div>
                    </div>

                    {/* HOME Page Settings */}
                    <div className="md:col-span-2">
                        <h3 className="font-semibold mb-3 text-gray-700">HOME 페이지 연동</h3>
                        <div className="space-y-3">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={settings.homeEnabled}
                                    onChange={(e) => setSettings({ ...settings, homeEnabled: e.target.checked })}
                                    className="mr-2"
                                />
                                <span className="text-sm">HOME 페이지에 갤러리 표시</span>
                            </label>
                            {settings.homeEnabled && (
                                <div>
                                    <label className="block text-sm font-medium mb-1">HOME 표시 개수</label>
                                    <input
                                        type="number"
                                        min="3"
                                        max="12"
                                        value={settings.homeCount}
                                        onChange={(e) => setSettings({ ...settings, homeCount: parseInt(e.target.value) })}
                                        className="w-full p-2 border border-gray-300 rounded"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">3-12 사이의 값 (권장: 6)</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <button
                        onClick={handleSaveSettings}
                        disabled={saving}
                        className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400"
                    >
                        {saving ? '저장 중...' : '설정 저장'}
                    </button>
                </div>
            </div>

            {/* Posts Management */}
            <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">게시글 관리 ({posts.length}개)</h2>
                    <Link
                        href="/board/GALLERY/write"
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                        새 게시글 작성
                    </Link>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left">제목</th>
                                <th className="px-4 py-2 text-left">작성자</th>
                                <th className="px-4 py-2 text-center">조회수</th>
                                <th className="px-4 py-2 text-center">첨부파일</th>
                                <th className="px-4 py-2 text-center">작성일</th>
                                <th className="px-4 py-2 text-center">관리</th>
                            </tr>
                        </thead>
                        <tbody>
                            {posts.map((post) => (
                                <tr key={post.id} className="border-b hover:bg-gray-50">
                                    <td className="px-4 py-3">
                                        <Link
                                            href={`/board/GALLERY/${post.id}?from=admin`}
                                            className="text-blue-600 hover:underline"
                                        >
                                            {post.title}
                                        </Link>
                                    </td>
                                    <td className="px-4 py-3">{post.author.name}</td>
                                    <td className="px-4 py-3 text-center">{post.viewCount}</td>
                                    <td className="px-4 py-3 text-center">
                                        {post.attachments.length > 0 && (
                                            <span className="text-gray-600">
                                                📎 {post.attachments.length}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-center text-sm text-gray-600">
                                        {new Date(post.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="flex justify-center gap-2">
                                            <Link
                                                href={`/board/GALLERY/edit/${post.id}`}
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
            </div>
        </div>
    );
}
