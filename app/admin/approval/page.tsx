'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { POSITION_LABELS } from '@/types/user';

interface PendingUser {
    id: number;
    username: string;
    name: string;
    phone: string;
    email: string | null;
    churchName: string;
    position: string;
    createdAt: string;
    rejectedReason?: string;
    rejectedAt?: string;
}

type TabType = 'pending' | 'rejected';
type ModalType = 'approve' | 'reject' | 'review' | 'delete' | null;

export default function ApprovalManagementPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<TabType>('pending');
    const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
    const [rejectedUsers, setRejectedUsers] = useState<PendingUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Modal states
    const [modalType, setModalType] = useState<ModalType>(null);
    const [selectedUser, setSelectedUser] = useState<PendingUser | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/admin/users?status=all', { cache: 'no-store' });
            const result = await response.json();

            if (result.success) {
                const pending = result.data.filter((user: any) =>
                    !user.isApproved && !user.rejectedAt
                );
                const rejected = result.data.filter((user: any) =>
                    user.rejectedAt
                );

                setPendingUsers(pending);
                setRejectedUsers(rejected);
            }
        } catch (error) {
            console.error('데이터 로드 오류:', error);
            showMessage('error', '데이터를 불러오는 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 5000);
    };

    const openModal = (type: ModalType, user: PendingUser) => {
        setModalType(type);
        setSelectedUser(user);
        setRejectReason('');
    };

    const closeModal = () => {
        setModalType(null);
        setSelectedUser(null);
        setRejectReason('');
    };

    const handleApprove = async () => {
        if (!selectedUser) return;
        setIsProcessing(true);

        try {
            const response = await fetch(`/api/admin/users/${selectedUser.id}/approve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ position: selectedUser.position })
            });

            const result = await response.json();
            if (result.success) {
                showMessage('success', `${selectedUser.name} 님이 승인되었습니다.`);
                fetchUsers();
                closeModal();
            } else {
                showMessage('error', result.error || '승인 처리 중 오류가 발생했습니다.');
            }
        } catch (error) {
            showMessage('error', '승인 처리 중 오류가 발생했습니다.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleReject = async () => {
        if (!selectedUser || !rejectReason.trim()) return;
        setIsProcessing(true);

        try {
            const response = await fetch(`/api/admin/users/${selectedUser.id}/reject`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason: rejectReason })
            });

            const result = await response.json();
            if (result.success) {
                showMessage('success', '거부 처리되었습니다.');
                fetchUsers();
                closeModal();
            } else {
                showMessage('error', result.error || '처리 중 오류가 발생했습니다.');
            }
        } catch (error) {
            showMessage('error', '처리 중 오류가 발생했습니다.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleReview = async () => {
        if (!selectedUser) return;
        setIsProcessing(true);

        try {
            const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    rejectedReason: null,
                    rejectedAt: null,
                    isApproved: false
                })
            });

            const result = await response.json();
            if (result.success) {
                showMessage('success', '재심사 대기 상태로 변경되었습니다.');
                fetchUsers();
                closeModal();
            } else {
                showMessage('error', result.error || '처리 중 오류가 발생했습니다.');
            }
        } catch (error) {
            showMessage('error', '처리 중 오류가 발생했습니다.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedUser) return;
        setIsProcessing(true);

        try {
            const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
                method: 'DELETE'
            });

            const result = await response.json();
            if (result.success) {
                showMessage('success', '삭제되었습니다.');
                fetchUsers();
                closeModal();
            } else {
                showMessage('error', result.error || '삭제 중 오류가 발생했습니다.');
            }
        } catch (error) {
            showMessage('error', '삭제 중 오류가 발생했습니다.');
        } finally {
            setIsProcessing(false);
        }
    };

    // Modal Component
    const renderModal = () => {
        if (!modalType || !selectedUser) return null;

        const modalConfig = {
            approve: {
                title: '회원 승인',
                icon: '✓',
                iconBg: 'bg-green-100',
                iconColor: 'text-green-600',
                message: (
                    <div className="space-y-3">
                        <p className="text-gray-700">
                            <strong>{selectedUser.name}</strong> 님의 가입을 승인하시겠습니까?
                        </p>
                        <div className="bg-gray-50 rounded-lg p-3 text-sm">
                            <div className="grid grid-cols-2 gap-2">
                                <div><span className="text-gray-500">소속교회:</span> {selectedUser.churchName}</div>
                                <div><span className="text-gray-500">직분:</span> {POSITION_LABELS[selectedUser.position] || selectedUser.position}</div>
                            </div>
                        </div>
                        <p className="text-sm text-blue-600">
                            ℹ️ {['목사', '장로', 'pastor', 'elder'].includes(selectedUser.position)
                                ? '정회원 (글쓰기, 보기 권한)으로 설정됩니다.'
                                : '일반회원 (보기 권한)으로 설정됩니다.'}
                        </p>
                    </div>
                ),
                confirmText: '승인',
                confirmClass: 'bg-green-500 hover:bg-green-600',
                onConfirm: handleApprove
            },
            reject: {
                title: '가입 거부',
                icon: '✕',
                iconBg: 'bg-red-100',
                iconColor: 'text-red-600',
                message: (
                    <div className="space-y-4">
                        <p className="text-gray-700">
                            <strong>{selectedUser.name}</strong> 님의 가입을 거부합니다.
                        </p>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                거부 사유 <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="거부 사유를 입력해주세요..."
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                                rows={3}
                                autoFocus
                            />
                        </div>
                    </div>
                ),
                confirmText: '거부',
                confirmClass: 'bg-red-500 hover:bg-red-600',
                confirmDisabled: !rejectReason.trim(),
                onConfirm: handleReject
            },
            review: {
                title: '재심사 요청',
                icon: '↺',
                iconBg: 'bg-blue-100',
                iconColor: 'text-blue-600',
                message: (
                    <div className="space-y-3">
                        <p className="text-gray-700">
                            <strong>{selectedUser.name}</strong> 님을 재심사 대기 상태로 변경하시겠습니까?
                        </p>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
                            <p>⚠️ 기존 거부 사유가 삭제되고 &apos;승인대기&apos; 탭으로 이동합니다.</p>
                        </div>
                    </div>
                ),
                confirmText: '재심사',
                confirmClass: 'bg-blue-500 hover:bg-blue-600',
                onConfirm: handleReview
            },
            delete: {
                title: '신청 삭제',
                icon: '🗑',
                iconBg: 'bg-gray-100',
                iconColor: 'text-gray-600',
                message: (
                    <div className="space-y-3">
                        <p className="text-gray-700">
                            <strong>{selectedUser.name}</strong> 님의 가입 신청을 삭제하시겠습니까?
                        </p>
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
                            <p>⚠️ 삭제 후에는 복구할 수 없습니다.</p>
                        </div>
                    </div>
                ),
                confirmText: '삭제',
                confirmClass: 'bg-gray-600 hover:bg-gray-700',
                onConfirm: handleDelete
            }
        };

        const config = modalConfig[modalType];

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
                {/* Backdrop */}
                <div
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    onClick={closeModal}
                />

                {/* Modal */}
                <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in duration-200">
                    {/* Header */}
                    <div className="flex items-center gap-4 p-6 border-b border-gray-100">
                        <div className={`w-12 h-12 ${config.iconBg} rounded-full flex items-center justify-center`}>
                            <span className={`text-2xl ${config.iconColor}`}>{config.icon}</span>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">{config.title}</h2>
                    </div>

                    {/* Body */}
                    <div className="p-6">
                        {config.message}
                    </div>

                    {/* Footer */}
                    <div className="flex gap-3 p-6 pt-0">
                        <button
                            onClick={closeModal}
                            disabled={isProcessing}
                            className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50"
                        >
                            취소
                        </button>
                        <button
                            onClick={config.onConfirm}
                            disabled={isProcessing || config.confirmDisabled}
                            className={`flex-1 px-4 py-3 text-white rounded-lg transition-colors font-medium disabled:opacity-50 ${config.confirmClass}`}
                        >
                            {isProcessing ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    처리 중...
                                </span>
                            ) : config.confirmText}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">가입승인 관리</h1>
                    <p className="text-gray-600 mt-1">
                        회원 가입 신청을 승인 또는 거부합니다.
                    </p>
                </div>
                <button
                    onClick={() => router.push('/admin/members')}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                    ← 회원 관리로 이동
                </button>
            </div>

            {/* Message */}
            {message && (
                <div
                    className={`p-4 rounded-lg flex items-center gap-3 ${message.type === 'success'
                            ? 'bg-green-50 text-green-800 border border-green-200'
                            : 'bg-red-50 text-red-800 border border-red-200'
                        }`}
                >
                    <span className="text-xl">{message.type === 'success' ? '✓' : '✕'}</span>
                    {message.text}
                </div>
            )}

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="flex space-x-8">
                    <button
                        onClick={() => setActiveTab('pending')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'pending'
                                ? 'border-yellow-500 text-yellow-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        승인대기
                        {pendingUsers.length > 0 && (
                            <span className="ml-2 py-0.5 px-2 rounded-full text-xs bg-yellow-100 text-yellow-800">
                                {pendingUsers.length}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('rejected')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'rejected'
                                ? 'border-red-500 text-red-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        거부됨
                        {rejectedUsers.length > 0 && (
                            <span className="ml-2 py-0.5 px-2 rounded-full text-xs bg-red-100 text-red-800">
                                {rejectedUsers.length}
                            </span>
                        )}
                    </button>
                </nav>
            </div>

            {/* Content */}
            {activeTab === 'pending' ? (
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 bg-yellow-50">
                        <h2 className="text-lg font-bold text-yellow-800">승인 대기 목록</h2>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue"></div>
                        </div>
                    ) : pendingUsers.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-gray-400 text-5xl mb-4">✓</div>
                            <p className="text-gray-500 text-lg">승인 대기 중인 회원이 없습니다.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">신청일</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">이름</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">아이디</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">소속교회</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">직분</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">연락처</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">처리</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {pendingUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(user.createdAt).toLocaleDateString('ko-KR')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {user.username}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {user.churchName}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                                                    {POSITION_LABELS[user.position] || user.position}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {user.phone}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => openModal('approve', user)}
                                                        className="px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-xs font-medium"
                                                    >
                                                        승인
                                                    </button>
                                                    <button
                                                        onClick={() => openModal('reject', user)}
                                                        className="px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-xs font-medium"
                                                    >
                                                        거부
                                                    </button>
                                                    <button
                                                        onClick={() => openModal('delete', user)}
                                                        className="px-3 py-1.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-xs font-medium"
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
                    )}
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 bg-red-50">
                        <h2 className="text-lg font-bold text-red-800">거부된 회원 목록</h2>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue"></div>
                        </div>
                    ) : rejectedUsers.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-gray-400 text-5xl mb-4">📋</div>
                            <p className="text-gray-500 text-lg">거부된 회원이 없습니다.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">거부일</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">이름</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">아이디</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">소속교회</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">직분</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">거부 사유</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">처리</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {rejectedUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {user.rejectedAt
                                                    ? new Date(user.rejectedAt).toLocaleDateString('ko-KR')
                                                    : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {user.username}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {user.churchName}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                                                    {POSITION_LABELS[user.position] || user.position}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-red-600 max-w-xs truncate" title={user.rejectedReason || ''}>
                                                {user.rejectedReason || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => openModal('review', user)}
                                                        className="px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-xs font-medium"
                                                    >
                                                        재심사
                                                    </button>
                                                    <button
                                                        onClick={() => openModal('delete', user)}
                                                        className="px-3 py-1.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-xs font-medium"
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
                    )}
                </div>
            )}

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-2">ℹ️ 승인/거부 처리 안내</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                    <li>• <strong>승인</strong>: 회원 가입을 승인하고 로그인을 허용합니다.</li>
                    <li>• <strong>거부</strong>: 가입 거부 사유를 기록하고 &apos;거부됨&apos; 탭으로 이동합니다.</li>
                    <li>• <strong>재심사</strong>: 거부된 회원을 다시 &apos;승인대기&apos; 상태로 변경합니다.</li>
                    <li>• 목사/장로 직분은 <strong>정회원</strong>, 전도사/일반교인은 <strong>일반회원</strong>으로 자동 설정됩니다.</li>
                </ul>
            </div>

            {/* Modal */}
            {renderModal()}
        </div>
    );
}
