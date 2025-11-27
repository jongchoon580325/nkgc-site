'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { POSITION_LABELS, ROLE_LABELS } from '@/types/user';

interface User {
    id: number;
    username: string;
    name: string;
    phone: string;
    email: string | null;
    churchName: string;
    position: string;
    role: string;
    isApproved: boolean;
    createdAt: string;
    lastLoginAt: string | null;
}

export default function AdminUsersPage() {
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({
        status: 'all',
        position: 'all',
        search: ''
    });

    useEffect(() => {
        fetchUsers();
    }, [filter]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (filter.status !== 'all') params.append('status', filter.status);
            if (filter.position !== 'all') params.append('position', filter.position);
            if (filter.search) params.append('search', filter.search);

            const response = await fetch(`/api/admin/users?${params}`);
            const result = await response.json();

            if (result.success) {
                setUsers(result.data);
            }
        } catch (error) {
            console.error('회원 조회 실패:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (userId: number, username: string) => {
        if (!confirm(`${username} 회원을 삭제하시겠습니까?`)) return;

        try {
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: 'DELETE'
            });

            const result = await response.json();
            if (result.success) {
                alert('삭제되었습니다.');
                fetchUsers();
            }
        } catch (error) {
            alert('삭제 중 오류가 발생했습니다.');
        }
    };

    const handleApprove = async (userId: number, position: string) => {
        if (!confirm('이 회원을 승인하시겠습니까?')) return;

        try {
            const response = await fetch(`/api/admin/users/${userId}/approve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ position })
            });

            const result = await response.json();
            if (result.success) {
                alert('승인되었습니다.');
                fetchUsers();
            }
        } catch (error) {
            alert('승인 처리 중 오류가 발생했습니다.');
        }
    };

    const handleReject = async (userId: number) => {
        const reason = prompt('거부 사유를 입력해주세요:');
        if (!reason) return;

        try {
            const response = await fetch(`/api/admin/users/${userId}/reject`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason })
            });

            const result = await response.json();
            if (result.success) {
                alert('거부되었습니다.');
                fetchUsers();
            }
        } catch (error) {
            alert('처리 중 오류가 발생했습니다.');
        }
    };

    const pendingCount = users.filter(u => !u.isApproved).length;

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-md">
                {/* 헤더 */}
                <div className="border-b border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-2xl font-bold">회원 관리</h1>
                            <p className="text-gray-600 mt-1">
                                전체 {users.length}명
                                {pendingCount > 0 && (
                                    <span className="ml-2 text-red-600 font-semibold">
                                        (승인 대기 {pendingCount}명)
                                    </span>
                                )}
                            </p>
                        </div>
                        <button
                            onClick={() => router.push('/admin/users/create')}
                            className="px-6 py-2 bg-primary-blue text-white rounded-lg hover:bg-brand-700 transition-colors"
                        >
                            + 회원 등록
                        </button>
                    </div>

                    {/* 필터 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                상태
                            </label>
                            <select
                                value={filter.status}
                                onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue"
                            >
                                <option value="all">전체</option>
                                <option value="pending">승인대기</option>
                                <option value="approved">승인완료</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                직분
                            </label>
                            <select
                                value={filter.position}
                                onChange={(e) => setFilter({ ...filter, position: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue"
                            >
                                <option value="all">전체</option>
                                <option value="pastor">목사</option>
                                <option value="elder">장로</option>
                                <option value="evangelist">전도사</option>
                                <option value="member">일반교인</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                검색
                            </label>
                            <input
                                type="text"
                                value={filter.search}
                                onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                                placeholder="이름, 아이디, 교회명, 연락처"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue"
                            />
                        </div>
                    </div>
                </div>

                {/* 회원 목록 */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    상태
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    이름
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    아이디
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    소속교회
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    직분
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    연락처
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    가입일
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    관리
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex justify-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-blue"></div>
                                        </div>
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                                        회원이 없습니다.
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {user.isApproved ? (
                                                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                                                    승인완료
                                                </span>
                                            ) : (
                                                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                                                    승인대기
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {user.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {user.username}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {user.churchName}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                                {POSITION_LABELS[user.position] || user.position}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {user.phone}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(user.createdAt).toLocaleDateString('ko-KR')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <div className="flex gap-2">
                                                {!user.isApproved && (
                                                    <>
                                                        <button
                                                            onClick={() => handleApprove(user.id, user.position)}
                                                            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors text-xs"
                                                        >
                                                            승인
                                                        </button>
                                                        <button
                                                            onClick={() => handleReject(user.id)}
                                                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-xs"
                                                        >
                                                            거부
                                                        </button>
                                                    </>
                                                )}
                                                <button
                                                    onClick={() => router.push(`/admin/users/${user.id}/edit`)}
                                                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-xs"
                                                >
                                                    수정
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user.id, user.username)}
                                                    className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors text-xs"
                                                >
                                                    삭제
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
