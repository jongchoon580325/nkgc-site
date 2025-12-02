'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface HeroConfig {
    id: number;
    name: string;
    isActive: boolean;
    backgroundImage: string | null;
    backgroundImageMobile: string | null;
    animationType: string;
    createdAt: string;
    updatedAt: string;
}

export default function HeroAdminPage() {
    const router = useRouter();
    const [configs, setConfigs] = useState<HeroConfig[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchConfigs();
    }, []);

    const fetchConfigs = async () => {
        try {
            const res = await fetch('/api/hero-config');
            if (res.ok) {
                const data = await res.json();
                setConfigs(data);
            }
        } catch (error) {
            console.error('Error fetching configs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleActivate = async (id: number) => {
        if (!confirm('이 프리셋을 활성화하시겠습니까?')) return;

        try {
            const res = await fetch(`/api/hero-config/${id}/activate`, {
                method: 'POST',
            });

            if (res.ok) {
                await fetchConfigs(); // 목록 새로고침
                alert('프리셋이 활성화되었습니다.');
            }
        } catch (error) {
            console.error('Error activating config:', error);
            alert('활성화에 실패했습니다.');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('이 프리셋을 삭제하시겠습니까? (복구할 수 없습니다)')) return;

        try {
            const res = await fetch(`/api/hero-config/${id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                await fetchConfigs();
                alert('프리셋이 삭제되었습니다.');
            } else {
                const data = await res.json();
                alert(data.error || '삭제에 실패했습니다.');
            }
        } catch (error) {
            console.error('Error deleting config:', error);
            alert('삭제에 실패했습니다.');
        }
    };

    const handleCreateNew = () => {
        if (configs.length >= 5) {
            alert('최대 5개의 프리셋만 생성할 수 있습니다.');
            return;
        }
        router.push('/admin/hero/new');
    };

    if (loading) {
        return (
            <div className="p-8">
                <div className="animate-pulse">로딩 중...</div>
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">히어로 섹션 관리</h1>
                <p className="text-gray-600">
                    홈 페이지 상단 배너를 관리합니다. 최대 5개의 프리셋을 저장할 수 있습니다.
                </p>
            </div>

            <div className="mb-6">
                <button
                    onClick={handleCreateNew}
                    disabled={configs.length >= 5}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                >
                    + 새 프리셋 만들기 ({configs.length}/5)
                </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {configs.map((config) => (
                    <div
                        key={config.id}
                        className={`bg-white rounded-xl p-6 border-2 ${config.isActive ? 'border-blue-500 shadow-lg' : 'border-gray-200'
                            }`}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-4">
                                {/* 썸네일 */}
                                <div className="w-32 h-20 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                                    {config.backgroundImage ? (
                                        <img
                                            src={config.backgroundImage}
                                            alt={config.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                                            No Image
                                        </div>
                                    )}
                                </div>

                                {/* 정보 */}
                                <div>
                                    <h3 className="text-xl font-bold mb-1">{config.name}</h3>
                                    <div className="flex items-center gap-2">
                                        {config.isActive && (
                                            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
                                                ⭐ 활성화됨
                                            </span>
                                        )}
                                        <span className="text-sm text-gray-500">
                                            애니메이션: {config.animationType}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* 버튼 그룹 */}
                            <div className="flex gap-2">
                                <Link
                                    href={`/admin/hero/edit/${config.id}`}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-medium"
                                >
                                    편집
                                </Link>
                                {!config.isActive && (
                                    <button
                                        onClick={() => handleActivate(config.id)}
                                        className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition text-sm font-medium"
                                    >
                                        활성화
                                    </button>
                                )}
                                {!config.isActive && (
                                    <button
                                        onClick={() => handleDelete(config.id)}
                                        className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition text-sm font-medium"
                                    >
                                        삭제
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="text-sm text-gray-500">
                            생성일: {new Date(config.createdAt).toLocaleDateString('ko-KR')}{' '}
                            | 수정일: {new Date(config.updatedAt).toLocaleDateString('ko-KR')}
                        </div>
                    </div>
                ))}

                {configs.length === 0 && (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                        <p className="text-gray-500 mb-4">아직 프리셋이 없습니다.</p>
                        <button
                            onClick={handleCreateNew}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            첫 번째 프리셋 만들기
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
