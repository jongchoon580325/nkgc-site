'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        passwordConfirm: '',
        name: '',
        phone: '',
        churchName: '',
        position: 'member',
        email: ''
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    const positions = [
        { value: 'pastor', label: '목사' },
        { value: 'elder', label: '장로' },
        { value: 'evangelist', label: '전도사' },
        { value: 'member', label: '일반교인' }
    ];

    // 전화번호 자동 포맷팅 함수
    const formatPhoneNumber = (value: string) => {
        // 숫자만 추출
        const numbers = value.replace(/[^\d]/g, '');

        // 길이에 따라 포맷팅
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        // 유효성 검사
        const newErrors: Record<string, string> = {};

        // 'admin' 포함 ID 차단 (관리자 페이지에서만 생성 가능)
        if (formData.username.toLowerCase().includes('admin')) {
            newErrors.username = "'admin'이 포함된 아이디는 사용할 수 없습니다.";
        }

        if (formData.username.length < 4) {
            newErrors.username = '아이디는 4자 이상이어야 합니다.';
        }

        if (formData.password.length < 6) {
            newErrors.password = '비밀번호는 6자 이상이어야 합니다.';
        }

        if (formData.password !== formData.passwordConfirm) {
            newErrors.passwordConfirm = '비밀번호가 일치하지 않습니다.';
        }

        if (!formData.name) {
            newErrors.name = '이름을 입력해주세요.';
        }

        if (!formData.phone) {
            newErrors.phone = '연락처를 입력해주세요.';
        }

        if (!formData.churchName) {
            newErrors.churchName = '소속 교회를 입력해주세요.';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (result.success) {
                alert('회원가입 신청이 완료되었습니다.\n관리자 승인 후 이용하실 수 있습니다.');
                router.push('/login');
            } else {
                alert(result.error || '회원가입에 실패했습니다.');
            }
        } catch (error) {
            alert('오류가 발생했습니다. 다시 시도해주세요.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container-custom max-w-2xl">
                <div className="bg-white rounded-2xl shadow-lg p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">회원가입</h1>
                        <p className="text-gray-600 mt-2">남경기노회 웹사이트에 오신 것을 환영합니다.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* 아이디 */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                아이디 <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                                placeholder="4자 이상의 영문, 숫자"
                            />
                            {errors.username && (
                                <p className="text-red-500 text-sm mt-1">{errors.username}</p>
                            )}
                        </div>

                        {/* 비밀번호 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    비밀번호 <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                                    placeholder="6자 이상"
                                />
                                {errors.password && (
                                    <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    비밀번호 확인 <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="password"
                                    value={formData.passwordConfirm}
                                    onChange={(e) => setFormData({ ...formData, passwordConfirm: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                                />
                                {errors.passwordConfirm && (
                                    <p className="text-red-500 text-sm mt-1">{errors.passwordConfirm}</p>
                                )}
                            </div>
                        </div>

                        {/* 이름 & 연락처 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    이름 <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                                />
                                {errors.name && (
                                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    연락처 <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={handlePhoneChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                                    placeholder="010-1234-5678"
                                    maxLength={13}
                                />
                                {errors.phone && (
                                    <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                                )}
                            </div>
                        </div>

                        {/* 소속 교회 & 직분 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    소속 교회 <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.churchName}
                                    onChange={(e) => setFormData({ ...formData, churchName: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                                    placeholder="예) 대유평교회"
                                />
                                {errors.churchName && (
                                    <p className="text-red-500 text-sm mt-1">{errors.churchName}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    직분 <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.position}
                                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                                >
                                    {positions.map((pos) => (
                                        <option key={pos.value} value={pos.value}>
                                            {pos.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* 이메일 (선택) */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                이메일 (선택)
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                                placeholder="example@email.com"
                            />
                        </div>

                        {/* 안내 메시지 */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-sm text-blue-800">
                                📌 <strong>회원가입 안내</strong><br />
                                회원가입 신청 후 관리자의 승인이 필요합니다.<br />
                                승인이 완료되면 정상적으로 로그인하여 서비스를 이용하실 수 있습니다.
                            </p>
                        </div>

                        {/* 버튼 */}
                        <div className="flex flex-col gap-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full px-6 py-4 bg-primary-blue text-white rounded-lg font-bold text-lg hover:bg-brand-700 transition-colors disabled:opacity-50 shadow-md hover:shadow-lg"
                            >
                                {loading ? '처리 중...' : '가입 신청하기'}
                            </button>
                            <div className="text-center text-sm text-gray-600">
                                이미 계정이 있으신가요?{' '}
                                <Link href="/login" className="text-primary-blue font-semibold hover:underline">
                                    로그인하기
                                </Link>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
