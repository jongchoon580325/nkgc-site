'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { POSITION_LABELS, ROLE_LABELS } from '@/types/user';

export default function EditUserPage() {
    const router = useRouter();
    const params = useParams();
    const userId = params.id as string;

    const [formData, setFormData] = useState({
        username: '',
        name: '',
        phone: '',
        churchName: '',
        position: 'member',
        email: '',
        role: '',
        isApproved: false,
        password: '' // 비밀번호 변경 시에만 사용
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const positions = [
        { value: 'pastor', label: '목사' },
        { value: 'elder', label: '장로' },
        { value: 'evangelist', label: '전도사' },
        { value: 'member', label: '일반교인' }
    ];

    const roles = [
        { value: 'super_admin', label: '최고관리자 (모든 권한)' },
        { value: 'admin', label: '관리자 (회원관리 제외)' },
        { value: 'member', label: '일반회원' },
        { value: 'pending', label: '승인대기' }
    ];

    // 전화번호 자동 포맷팅 함수
    const formatPhoneNumber = (value: string) => {
        const numbers = value.replace(/[^\d]/g, '');
        if (numbers.length <= 3) {
            return numbers;
        } else if (numbers.length <= 7) {
            return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
        } else {
            return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
        }
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatPhoneNumber(e.target.value);
        setFormData({ ...formData, phone: formatted });
    };

    useEffect(() => {
        fetchUser();
    }, [userId]);

    const fetchUser = async () => {
        try {
            const response = await fetch(`/api/admin/users/${userId}`);
            const result = await response.json();

            if (result.success) {
                const user = result.data;
                setFormData({
                    username: user.username,
                    name: user.name,
                    phone: user.phone,
                    churchName: user.churchName,
                    position: user.position,
                    email: user.email || '',
                    role: user.role,
                    isApproved: user.isApproved,
                    password: ''
                });
            } else {
                alert('회원 정보를 불러올 수 없습니다.');
                router.push('/admin/users');
            }
        } catch (error) {
            console.error('회원 조회 오류:', error);
            alert('오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        // 유효성 검사
        const newErrors: Record<string, string> = {};
        if (!formData.name) newErrors.name = '이름을 입력해주세요.';
        if (!formData.phone) newErrors.phone = '연락처를 입력해주세요.';
        if (!formData.churchName) newErrors.churchName = '소속 교회를 입력해주세요.';
        if (formData.password && formData.password.length < 6) {
            newErrors.password = '비밀번호는 6자 이상이어야 합니다.';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setSaving(true);

        try {
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (result.success) {
                alert('회원 정보가 수정되었습니다.');
                router.push('/admin/users');
            } else {
                alert(result.error || '수정에 실패했습니다.');
            }
        } catch (error) {
            alert('오류가 발생했습니다.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue"></div>
            </div>
        );
    }

    return (
        <div className="container-custom py-8 max-w-2xl">
            <div className="bg-white rounded-lg shadow-md p-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">회원 정보 수정</h1>
                    <span className="text-sm text-gray-500">ID: {formData.username}</span>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* 이름 */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            이름 <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue"
                        />
                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                    </div>

                    {/* 연락처 */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            연락처 <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="tel"
                            value={formData.phone}
                            onChange={handlePhoneChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue"
                            maxLength={13}
                        />
                        {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                    </div>

                    {/* 소속 교회 */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            소속 교회 <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.churchName}
                            onChange={(e) => setFormData({ ...formData, churchName: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue"
                        />
                        {errors.churchName && <p className="text-red-500 text-sm mt-1">{errors.churchName}</p>}
                    </div>

                    {/* 직분 */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            직분 <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={formData.position}
                            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue"
                        >
                            {positions.map((pos) => (
                                <option key={pos.value} value={pos.value}>
                                    {pos.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* 권한 (관리자 전용 설정) */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            시스템 권한 설정 (관리자 전용)
                        </label>
                        <select
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue mb-2"
                        >
                            {roles.map((role) => (
                                <option key={role.value} value={role.value}>
                                    {role.label}
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-500">
                            * 최고관리자: 모든 권한 (회원관리 포함) | 관리자: 회원관리 제외한 모든 권한
                        </p>
                    </div>

                    {/* 이메일 */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            이메일 (선택)
                        </label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue"
                        />
                    </div>

                    {/* 비밀번호 변경 */}
                    <div className="border-t pt-6 mt-6">
                        <h3 className="text-lg font-semibold mb-4">비밀번호 변경</h3>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            새 비밀번호 (변경시에만 입력)
                        </label>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue"
                            placeholder="변경하지 않으려면 비워두세요"
                        />
                        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                    </div>

                    {/* 버튼 */}
                    <div className="flex gap-4 pt-4">
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 px-6 py-3 bg-primary-blue text-white rounded-lg font-semibold hover:bg-brand-700 transition-colors disabled:opacity-50"
                        >
                            {saving ? '저장 중...' : '수정사항 저장'}
                        </button>
                        <button
                            type="button"
                            onClick={() => router.push('/admin/users')}
                            className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                        >
                            취소
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
