'use client'

import { useState, useEffect } from 'react'

interface StandingCommittee {
    id: number
    name: string
    headTitle: string
    head: string
    headRole: string
    secretary: string
    secretaryRole: string
    members: string
    term: string
    displayOrder: number
}

export default function StandingCommitteesAdminPage() {
    const [committees, setCommittees] = useState<StandingCommittee[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    // Modal states
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [selectedCommittee, setSelectedCommittee] = useState<StandingCommittee | null>(null)

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        headTitle: '부장',
        head: '',
        headRole: '목사',
        secretary: '',
        secretaryRole: '목사',
        members: '',
        term: '48회기 – 49회기 (2025년-2026년)',
        displayOrder: 999
    })

    // Term setting state
    const [currentTerm, setCurrentTerm] = useState('')
    const [isSavingTerm, setIsSavingTerm] = useState(false)

    useEffect(() => {
        fetchCommittees()
        fetchTermSetting()
    }, [])

    const fetchTermSetting = async () => {
        try {
            const response = await fetch('/api/admin/settings?key=current_term')
            const result = await response.json()
            if (result.success && result.data) {
                setCurrentTerm(result.data.value)
            }
        } catch (err) {
            console.error('회기 설정 로드 실패:', err)
        }
    }

    const handleSaveTerm = async () => {
        try {
            setIsSavingTerm(true)
            const response = await fetch('/api/admin/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    key: 'current_term',
                    value: currentTerm
                })
            })
            const result = await response.json()
            if (result.success) {
                showMessage('success', '회기 정보가 저장되었습니다.')
            } else {
                showMessage('error', result.error || '저장에 실패했습니다.')
            }
        } catch (err) {
            showMessage('error', '저장 중 오류가 발생했습니다.')
        } finally {
            setIsSavingTerm(false)
        }
    }

    const fetchCommittees = async () => {
        try {
            setIsLoading(true)
            const response = await fetch('/api/admin/standing-committees')
            const result = await response.json()

            if (result.success) {
                setCommittees(result.data)
            } else {
                showMessage('error', result.error || '데이터를 불러올 수 없습니다.')
            }
        } catch (err) {
            showMessage('error', '데이터를 불러오는 중 오류가 발생했습니다.')
        } finally {
            setIsLoading(false)
        }
    }

    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text })
        setTimeout(() => setMessage(null), 5000)
    }

    const handleEdit = (committee: StandingCommittee) => {
        setSelectedCommittee(committee)
        setFormData({
            name: committee.name,
            headTitle: committee.headTitle,
            head: committee.head,
            headRole: committee.headRole,
            secretary: committee.secretary,
            secretaryRole: committee.secretaryRole,
            members: committee.members,
            term: committee.term,
            displayOrder: committee.displayOrder
        })
        setIsEditModalOpen(true)
    }

    const handleAdd = () => {
        setFormData({
            name: '',
            headTitle: '부장',
            head: '',
            headRole: '목사',
            secretary: '',
            secretaryRole: '목사',
            members: '',
            term: currentTerm || '48회기 – 49회기 (2025년-2026년)',
            displayOrder: committees.length + 1
        })
        setIsAddModalOpen(true)
    }

    const handleSubmitEdit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedCommittee) return

        try {
            const response = await fetch(`/api/admin/standing-committees/${selectedCommittee.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            const result = await response.json()

            if (result.success) {
                showMessage('success', '상비부 정보가 수정되었습니다.')
                setIsEditModalOpen(false)
                fetchCommittees()
            } else {
                showMessage('error', result.error || '수정에 실패했습니다.')
            }
        } catch (err) {
            showMessage('error', '수정 중 오류가 발생했습니다.')
        }
    }

    const handleSubmitAdd = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            const response = await fetch('/api/admin/standing-committees', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            const result = await response.json()

            if (result.success) {
                showMessage('success', '상비부가 추가되었습니다.')
                setIsAddModalOpen(false)
                fetchCommittees()
            } else {
                showMessage('error', result.error || '추가에 실패했습니다.')
            }
        } catch (err) {
            showMessage('error', '추가 중 오류가 발생했습니다.')
        }
    }

    const handleDelete = async (committee: StandingCommittee) => {
        if (!confirm(`${committee.name}을(를) 정말 삭제하시겠습니까?`)) {
            return
        }

        try {
            const response = await fetch(`/api/admin/standing-committees/${committee.id}`, {
                method: 'DELETE'
            })

            const result = await response.json()

            if (result.success) {
                showMessage('success', '상비부가 삭제되었습니다.')
                fetchCommittees()
            } else {
                showMessage('error', result.error || '삭제에 실패했습니다.')
            }
        } catch (err) {
            showMessage('error', '삭제 중 오류가 발생했습니다.')
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">상비부 관리</h1>
                    <p className="mt-1 text-sm text-gray-600">상비부 정보를 관리합니다</p>
                </div>
                <button
                    onClick={handleAdd}
                    className="px-6 py-3 bg-primary-blue text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-md flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    상비부 추가
                </button>
            </div>

            {/* Term Setting Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">회기 설정</h2>
                <div className="flex gap-4 items-end">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">현재 회기 표시 문구</label>
                        <input
                            type="text"
                            value={currentTerm}
                            onChange={(e) => setCurrentTerm(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue"
                            placeholder="예: 48회기 – 49회기 (2025년-2026년)"
                        />
                    </div>
                    <button
                        onClick={handleSaveTerm}
                        disabled={isSavingTerm}
                        className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors font-medium disabled:opacity-50"
                    >
                        {isSavingTerm ? '저장 중...' : '설정 저장'}
                    </button>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                    * 이 설정은 공개 페이지 상단에 표시되는 회기 정보에 적용됩니다.
                </p>
            </div>

            {/* Message */}
            {message && (
                <div
                    className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                        }`}
                >
                    {message.text}
                </div>
            )}

            {/* Committees List */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-bold text-gray-900">
                        상비부 목록 ({committees.length}개)
                    </h2>
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue"></div>
                    </div>
                ) : committees.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500">등록된 상비부가 없습니다.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        순서
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        상비부명
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {'{부장/위원장/국장}'}
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        서기
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        위원
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        작업
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {committees.map((committee) => (
                                    <tr key={committee.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-900">{committee.displayOrder}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{committee.name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {committee.head} ({committee.headRole})
                                            </div>
                                            <div className="text-xs text-gray-500">{committee.headTitle}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {committee.secretary} ({committee.secretaryRole})
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-500 max-w-xs truncate">
                                                {committee.members || '-'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => handleEdit(committee)}
                                                className="text-primary-blue hover:text-blue-700 mr-4"
                                            >
                                                수정
                                            </button>
                                            <button
                                                onClick={() => handleDelete(committee)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                삭제
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {isEditModalOpen && (
                <CommitteeModal
                    title="상비부 정보 수정"
                    formData={formData}
                    setFormData={setFormData}
                    onSubmit={handleSubmitEdit}
                    onClose={() => setIsEditModalOpen(false)}
                />
            )}

            {/* Add Modal */}
            {isAddModalOpen && (
                <CommitteeModal
                    title="상비부 추가"
                    formData={formData}
                    setFormData={setFormData}
                    onSubmit={handleSubmitAdd}
                    onClose={() => setIsAddModalOpen(false)}
                />
            )}
        </div>
    )
}

// Modal Component
function CommitteeModal({
    title,
    formData,
    setFormData,
    onSubmit,
    onClose
}: {
    title: string
    formData: any
    setFormData: (data: any) => void
    onSubmit: (e: React.FormEvent) => void
    onClose: () => void
}) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6 my-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{title}</h2>
                <form onSubmit={onSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">상비부명 *</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">직책 종류 *</label>
                            <select
                                value={formData.headTitle}
                                onChange={(e) => setFormData({ ...formData, headTitle: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue"
                                required
                            >
                                <option value="부장">부장</option>
                                <option value="위원장">위원장</option>
                                <option value="국장">국장</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">부장/위원장/국장 이름 *</label>
                            <input
                                type="text"
                                value={formData.head}
                                onChange={(e) => setFormData({ ...formData, head: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">역할 *</label>
                            <select
                                value={formData.headRole}
                                onChange={(e) => setFormData({ ...formData, headRole: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue"
                                required
                            >
                                <option value="목사">목사</option>
                                <option value="장로">장로</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">서기 이름 *</label>
                            <input
                                type="text"
                                value={formData.secretary}
                                onChange={(e) => setFormData({ ...formData, secretary: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">역할 *</label>
                            <select
                                value={formData.secretaryRole}
                                onChange={(e) => setFormData({ ...formData, secretaryRole: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue"
                                required
                            >
                                <option value="목사">목사</option>
                                <option value="장로">장로</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">위원 (쉼표로 구분)</label>
                        <textarea
                            value={formData.members}
                            onChange={(e) => setFormData({ ...formData, members: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue"
                            rows={3}
                            placeholder="예: 김철수, 이영희, 박민수"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">회기 *</label>
                            <input
                                type="text"
                                value={formData.term}
                                onChange={(e) => setFormData({ ...formData, term: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">표시 순서 *</label>
                            <input
                                type="number"
                                value={formData.displayOrder}
                                onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-primary-blue text-white rounded-lg hover:bg-blue-700 font-semibold"
                        >
                            {title.includes('추가') ? '추가' : '수정'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold"
                        >
                            취소
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
