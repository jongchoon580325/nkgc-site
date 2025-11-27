'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ContactInfo {
    secretary: {
        name: string;
        phone: string;
    };
    president: {
        name: string;
        phone: string;
    };
    address: string;
    email: string;
}

export default function AdminContactPage() {
    const router = useRouter();
    const [data, setData] = useState<ContactInfo>({
        secretary: { name: '', phone: '' },
        president: { name: '', phone: '' },
        address: '',
        email: '',
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await fetch('/api/contact-info');
            const result = await response.json();
            setData(result);
        } catch (error) {
            alert('데이터 로드 실패');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const response = await fetch('/api/contact-info', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                alert('✅ 성공적으로 저장되었습니다!');
                router.push('/');
            } else {
                alert('❌ 저장 실패');
            }
        } catch (error) {
            alert('❌ 오류 발생');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-md p-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">연락처 관리</h2>
                    <p className="text-sm text-gray-600 mt-1">Footer에 표시되는 연락처 정보를 수정합니다</p>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6 space-y-6">
                {/* Secretary */}
                <div className="border-b pb-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">서기 정보</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                이름 *
                            </label>
                            <input
                                type="text"
                                required
                                value={data.secretary.name}
                                onChange={(e) =>
                                    setData({
                                        ...data,
                                        secretary: { ...data.secretary, name: e.target.value },
                                    })
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                연락처 *
                            </label>
                            <input
                                type="tel"
                                required
                                value={data.secretary.phone}
                                onChange={(e) =>
                                    setData({
                                        ...data,
                                        secretary: { ...data.secretary, phone: e.target.value },
                                    })
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue"
                            />
                        </div>
                    </div>
                </div>

                {/* President */}
                <div className="border-b pb-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">노회장 정보</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                이름 *
                            </label>
                            <input
                                type="text"
                                required
                                value={data.president.name}
                                onChange={(e) =>
                                    setData({
                                        ...data,
                                        president: { ...data.president, name: e.target.value },
                                    })
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                연락처 *
                            </label>
                            <input
                                type="tel"
                                required
                                value={data.president.phone}
                                onChange={(e) =>
                                    setData({
                                        ...data,
                                        president: { ...data.president, phone: e.target.value },
                                    })
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue"
                            />
                        </div>
                    </div>
                </div>

                {/* Address */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        주소 *
                    </label>
                    <input
                        type="text"
                        required
                        value={data.address}
                        onChange={(e) => setData({ ...data, address: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue"
                    />
                </div>

                {/* Email */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        이메일 *
                    </label>
                    <input
                        type="email"
                        required
                        value={data.email}
                        onChange={(e) => setData({ ...data, email: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue"
                    />
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-6 border-t">
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex-1 px-6 py-3 bg-primary-blue text-white rounded-lg font-semibold hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? '저장 중...' : '✅ 저장하기'}
                    </button>
                    <a
                        href="/"
                        className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors text-center"
                    >
                        취소
                    </a>
                </div>
            </form>

            {/* Info */}
            <div className="bg-blue-50 border-l-4 border-primary-blue p-6 rounded-lg">
                <h3 className="font-bold text-gray-900 mb-3">📌 사용 안내</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                    <li>• 이 정보는 모든 페이지 하단 Footer에 표시됩니다.</li>
                    <li>• 서기와 노회장의 이름과 연락처를 입력하세요.</li>
                    <li>• 주소는 노회 사무실 주소를 입력하세요.</li>
                    <li>• 이메일은 공식 연락용 이메일 주소를 입력하세요.</li>
                    <li>• 저장 후 즉시 모든 페이지에 반영됩니다.</li>
                </ul>
            </div>
        </div>
    );
}
