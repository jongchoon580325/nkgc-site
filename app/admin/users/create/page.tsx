'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateUserPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        name: '',
        phone: '',
        churchName: '',
        position: 'member',
        email: '',
        role: 'member',
        isApproved: true
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

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

    // 전화번호 입력 핸들러
    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatPhoneNumber(e.target.value);
        setFormData({ ...formData, phone: formatted });
    };

    // Username 변경 핸들러 - admin 포함 시 자동으로 super_admin 권한 부여
    const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const username = e.target.value;
        const containsAdmin = username.toLowerCase().includes('admin');

        setFormData({
            ...formData,
            username: username,
            role: containsAdmin ? 'super_admin' : formData.role
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        // 유효성 검사
        const newErrors: Record<string, string> = {};

        // Username에 admin 포함 여부 체크
        if (formData.username.toLowerCase().includes('admin')) {
            // admin 포함된 ID는 자동으로 super_admin 권한으로 설정
            formData.role = 'super_admin';
        }

        if (formData.username.length < 4) {
            newErrors.username = '아이디는 4자 이상이어야 합니다.';
        }
        if (formData.password.length < 6) {
            newErrors.password = '비밀번호는 6자 이상이어야 합니다.';
        }
        if (!formData.name) newErrors.name = '이름을 입력해주세요.';
        if (!formData.phone) newErrors.phone = '연락처를 입력해주세요.';
        if (!formData.churchName) newErrors.churchName = '소속 교회를 입력해주세요.';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/admin/users/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (result.success) {
                alert('회원이 등록되었습니다.');
                router.push('/admin/users');
            } else {
                alert(result.error || '등록에 실패했습니다.');
            }
        } catch (error) {
            alert('오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    // admin 포함 여부 확인
    const containsAdmin = formData.username.toLowerCase().includes('admin');

    return (
        <div className="container-custom py-8 max-w-2xl">
            <div className="bg-white rounded-lg shadow-md p-8">
                <h1 className="text-2xl font-bold mb-6">회원 등록</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* 아이디 */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            아이디 <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.username}
                            onChange={handleUsernameChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue"
                            placeholder="4자 이상"
                        />
                        {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
                        {containsAdmin && (
                            <p className="text-blue-600 text-sm mt-1">
                                ℹ️ 'admin' 포함 ID는 자동으로 최고관리자 권한이 부여됩니다.
                            </p>
                        )}
                    </div>

                    {/* 비밀번호 */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            비밀번호 <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue"
                            placeholder="6자 이상"
                        />
                        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                    </div>

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
                            maxLength={13}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue"
                            placeholder="010-1234-5678"
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

                    {/* 시스템 권한 설정 */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            시스템 권한 설정 <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            disabled={containsAdmin}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue disabled:bg-gray-100 disabled:cursor-not-allowed"
                        >
                            {roles.map((role) => (
                                <option key={role.value} value={role.value}>
                                    {role.label}
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-2">
                            {containsAdmin
                                ? "⚠️ 'admin' 포함 ID는 자동으로 최고관리자 권한이 설정됩니다."
                                : "* 최고관리자: 모든 권한 (회원관리 포함) | 관리자: 회원관리 제외한 모든 권한"
                            }
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

                    {/* 버튼 */}
                    <div className="flex gap-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-6 py-3 bg-primary-blue text-white rounded-lg font-semibold hover:bg-brand-700 transition-colors disabled:opacity-50"
                        >
                            {loading ? '처리 중...' : '등록'}
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
