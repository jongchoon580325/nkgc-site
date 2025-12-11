'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

interface MemberFormData {
    name: string
    churchName: string
    position: string
    category: string
    phone: string
    role: string
    username: string
    password: string
}

export default function EditMemberPage() {
    const { data: session } = useSession()
    const router = useRouter()
    const params = useParams()
    const memberId = params.id as string

    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    // 권한 확인: admin 또는 master 아이디인 경우만 ID 수정 가능
    const isSuperAdmin = session?.user && ['admin', 'master'].includes((session.user as any).username || '');

    const [formData, setFormData] = useState<MemberFormData>({
        name: '',
        churchName: '',
        position: '목사',
        category: '',
        phone: '',
        role: 'member',
        username: '',
        password: ''
    })

    useEffect(() => {
        fetchMember()
    }, [memberId])

    const fetchMember = async () => {
        try {
            const response = await fetch(`/api/admin/members/${memberId}`)
            const result = await response.json()

            if (result.success) {
                const member = result.data
                // 기존 role 값을 position 기반으로 변환 (구 체계 호환)
                let memberRole = member.role;
                if (['pastor', 'elder'].includes(member.role)) {
                    memberRole = 'member'; // 정회원
                } else if (['evangelist'].includes(member.role)) {
                    memberRole = 'guest'; // 일반회원
                }

                setFormData({
                    name: member.name || '',
                    churchName: member.churchName || '',
                    position: member.position || '목사',
                    category: member.category || '',
                    phone: member.phone || '',
                    role: memberRole,
                    username: member.username || '',
                    password: ''
                })
            } else {
                setMessage({ type: 'error', text: '회원 정보를 불러올 수 없습니다.' })
            }
        } catch (error) {
            setMessage({ type: 'error', text: '데이터 로딩 중 오류가 발생했습니다.' })
        } finally {
            setIsLoading(false)
        }
    }

    // 직분 변경 시 권한 자동 설정
    const handlePositionChange = (newPosition: string) => {
        const isMemberPosition = ['목사', '장로', 'pastor', 'elder'].includes(newPosition);
        const newRole = isMemberPosition ? 'member' : 'guest';
        setFormData({ ...formData, position: newPosition, role: newRole });
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)

        try {
            const response = await fetch(`/api/admin/members/${memberId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            const result = await response.json()

            if (result.success) {
                setMessage({ type: 'success', text: '회원 정보가 수정되었습니다.' })
                setTimeout(() => router.push('/admin/members'), 1500)
            } else {
                setMessage({ type: 'error', text: result.error || '수정에 실패했습니다.' })
            }
        } catch (err) {
            setMessage({ type: 'error', text: '수정 중 오류가 발생했습니다.' })
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-gray-500">로딩 중...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-2xl mx-auto px-4">
                {/* Header */}
                <div className="mb-6">
                    <Link
                        href="/admin/members"
                        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        회원관리로 돌아가기
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">회원 정보 수정</h1>
                    <p className="text-gray-600 mt-1">회원의 기본 정보와 계정 정보를 수정합니다.</p>
                </div>

                {/* Message */}
                {message && (
                    <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                        {message.text}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* 기본 정보 */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">기본 정보</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">이름 *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">교회명 *</label>
                                <input
                                    type="text"
                                    value={formData.churchName}
                                    onChange={(e) => setFormData({ ...formData, churchName: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">직분 *</label>
                                <select
                                    value={formData.position}
                                    onChange={(e) => handlePositionChange(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                                    required
                                >
                                    <option value="목사">목사</option>
                                    <option value="장로">장로</option>
                                    <option value="전도사">전도사</option>
                                    <option value="교인">교인</option>
                                </select>
                                <p className="text-xs text-gray-500 mt-1">
                                    목사/장로 → 정회원, 전도사/교인 → 일반회원 자동 설정
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">구분</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                                >
                                    <option value="">선택하세요</option>
                                    <option value="원로">원로</option>
                                    <option value="위임">위임</option>
                                    <option value="시무">시무</option>
                                    <option value="부목사">부목사</option>
                                    <option value="전도사">전도사</option>
                                    <option value="장로">장로</option>
                                    <option value="은퇴">은퇴</option>
                                    <option value="무임">무임</option>
                                    <option value="선교사">선교사</option>
                                    <option value="기타">기타</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">연락처 *</label>
                                <input
                                    type="text"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                                    placeholder="010-0000-0000"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">회원권한</label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                                    required
                                >
                                    <option value="member">정회원 (글쓰기, 보기)</option>
                                    <option value="guest">일반회원 (보기만)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* 계정 정보 */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                            계정 정보 {isSuperAdmin ? '(최고관리자 수정 가능)' : '(선택사항)'}
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">아이디</label>
                                <input
                                    type="text"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    disabled={!isSuperAdmin}
                                    className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent ${!isSuperAdmin ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                                />
                                {!isSuperAdmin ? (
                                    <p className="mt-1 text-xs text-gray-500">아이디는 최고관리자만 변경할 수 있습니다.</p>
                                ) : (
                                    <p className="mt-1 text-xs text-blue-600 font-medium">최고관리자 권한으로 아이디 수정이 가능합니다.</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호 재설정</label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="변경하려면 입력하세요"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                                />
                                <p className="mt-1 text-xs text-gray-500">비워두면 기존 비밀번호가 유지됩니다.</p>
                            </div>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end gap-3">
                        <Link
                            href="/admin/members"
                            className="px-6 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                        >
                            취소
                        </Link>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="px-6 py-2.5 text-white bg-primary-blue rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                        >
                            {isSaving ? '저장 중...' : '저장'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
