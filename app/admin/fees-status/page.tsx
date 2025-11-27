'use client'

import { useState, useEffect } from 'react'

interface FeeStatus {
    id: number
    inspection: string
    churchName: string
    pastorName: string
    monthlyFee: number
    annualFee: number
}

export default function FeesStatusAdminPage() {
    const [fees, setFees] = useState<FeeStatus[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
    const [currentTerm, setCurrentTerm] = useState('')

    // Modal states
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [selectedFee, setSelectedFee] = useState<FeeStatus | null>(null)

    // Form state
    const [formData, setFormData] = useState({
        inspection: '동부',
        churchName: '',
        pastorName: '',
        monthlyFee: '',
        annualFee: ''
    })

    const inspections = ['동부', '서부', '남부', '북부']

    useEffect(() => {
        fetchFees()
        fetchTermSetting()
    }, [])

    const fetchFees = async () => {
        try {
            setIsLoading(true)
            const response = await fetch('/api/admin/fees-status')
            const result = await response.json()

            if (result.success) {
                setFees(result.data)
            } else {
                showMessage('error', result.error || '데이터를 불러올 수 없습니다.')
            }
        } catch (err) {
            showMessage('error', '데이터를 불러오는 중 오류가 발생했습니다.')
        } finally {
            setIsLoading(false)
        }
    }

    const fetchTermSetting = async () => {
        try {
            const response = await fetch('/api/admin/settings?key=current_term')
            const result = await response.json()
            if (result.success && result.data) {
                setCurrentTerm(result.data.value)
            }
        } catch (error) {
            console.error('회기 설정 불러오기 실패:', error)
        }
    }

    const saveTermSetting = async () => {
        try {
            const response = await fetch('/api/admin/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: 'current_term', value: currentTerm })
            })
            const result = await response.json()
            if (result.success) {
                showMessage('success', '회기 설정이 저장되었습니다.')
            } else {
                showMessage('error', '설정 저장 실패')
            }
        } catch (error) {
            showMessage('error', '설정 업데이트 에러')
        }
    }

    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text })
        setTimeout(() => setMessage(null), 5000)
    }

    const handleEdit = (fee: FeeStatus) => {
        setSelectedFee(fee)
        setFormData({
            inspection: fee.inspection,
            churchName: fee.churchName,
            pastorName: fee.pastorName,
            monthlyFee: fee.monthlyFee.toString(),
            annualFee: fee.annualFee.toString()
        })
        setIsEditModalOpen(true)
    }

    const handleAdd = () => {
        setFormData({
            inspection: '동부',
            churchName: '',
            pastorName: '',
            monthlyFee: '',
            annualFee: ''
        })
        setIsAddModalOpen(true)
    }

    const handleSubmitEdit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedFee) return

        // 콤마 제거 후 전송
        const sanitizedData = {
            ...formData,
            monthlyFee: parseInt(formData.monthlyFee.replace(/,/g, '') || '0'),
            annualFee: parseInt(formData.annualFee.replace(/,/g, '') || '0')
        }

        try {
            const response = await fetch(`/api/admin/fees-status/${selectedFee.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(sanitizedData)
            })

            const result = await response.json()

            if (result.success) {
                showMessage('success', '상회비 정보가 수정되었습니다.')
                setIsEditModalOpen(false)
                fetchFees()
            } else {
                showMessage('error', result.error || '수정에 실패했습니다.')
            }
        } catch (err) {
            showMessage('error', '수정 중 오류가 발생했습니다.')
        }
    }

    const handleSubmitAdd = async (e: React.FormEvent) => {
        e.preventDefault()

        // 콤마 제거 후 전송
        const sanitizedData = {
            ...formData,
            monthlyFee: parseInt(formData.monthlyFee.replace(/,/g, '') || '0'),
            annualFee: parseInt(formData.annualFee.replace(/,/g, '') || '0')
        }

        try {
            const response = await fetch('/api/admin/fees-status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(sanitizedData)
            })

            const result = await response.json()

            if (result.success) {
                showMessage('success', '상회비 정보가 추가되었습니다.')
                setIsAddModalOpen(false)
                fetchFees()
            } else {
                showMessage('error', result.error || '추가에 실패했습니다.')
            }
        } catch (err) {
            showMessage('error', '추가 중 오류가 발생했습니다.')
        }
    }

    const handleDelete = async (fee: FeeStatus) => {
        if (!confirm(`${fee.churchName}의 상회비 정보를 삭제하시겠습니까?`)) {
            return
        }

        try {
            const response = await fetch(`/api/admin/fees-status/${fee.id}`, {
                method: 'DELETE'
            })

            const result = await response.json()

            if (result.success) {
                showMessage('success', '삭제되었습니다.')
                fetchFees()
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
                    <h1 className="text-3xl font-bold text-gray-900">상회비 관리</h1>
                    <p className="mt-1 text-sm text-gray-600">상회비 납부 현황을 관리합니다</p>
                </div>
                <button
                    onClick={handleAdd}
                    className="px-6 py-3 bg-primary-blue text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-md flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    상회비 추가
                </button>
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

            {/* Term Setting */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-lg font-bold text-gray-900 mb-4">회기 설정</h2>
                <div className="flex gap-4 items-end">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">현재 회기 표시 문구</label>
                        <input
                            type="text"
                            value={currentTerm}
                            onChange={(e) => setCurrentTerm(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue"
                            placeholder="예: 50회기 - 51회기 (2026년-2027년)"
                        />
                    </div>
                    <button
                        onClick={saveTermSetting}
                        className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 font-medium"
                    >
                        설정 저장
                    </button>
                </div>
                <p className="mt-2 text-sm text-gray-500">* 이 설정은 공개 페이지 상단에 표시되는 회기 정보에 적용됩니다.</p>
            </div>

            {/* Fees List */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-bold text-gray-900">
                        상회비 목록 ({fees.length}개)
                    </h2>
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue"></div>
                    </div>
                ) : fees.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500">등록된 데이터가 없습니다.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">시찰</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">교회명</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">담임목사</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">월회비</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">연회비</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">작업</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {fees.map((fee) => (
                                    <tr key={fee.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full 
                                                ${fee.inspection === '동부' ? 'bg-blue-100 text-blue-800' :
                                                    fee.inspection === '서부' ? 'bg-green-100 text-green-800' :
                                                        fee.inspection === '남부' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-purple-100 text-purple-800'}`}>
                                                {fee.inspection}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                                            {fee.churchName}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                            {fee.pastorName}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900">
                                            {fee.monthlyFee.toLocaleString()}원
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900 font-medium">
                                            {fee.annualFee.toLocaleString()}원
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                            <button
                                                onClick={() => handleEdit(fee)}
                                                className="text-primary-blue hover:text-blue-700 mr-4"
                                            >
                                                수정
                                            </button>
                                            <button
                                                onClick={() => handleDelete(fee)}
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
                <FeeModal
                    title="상회비 정보 수정"
                    formData={formData}
                    setFormData={setFormData}
                    onSubmit={handleSubmitEdit}
                    onClose={() => setIsEditModalOpen(false)}
                    inspections={inspections}
                />
            )}

            {/* Add Modal */}
            {isAddModalOpen && (
                <FeeModal
                    title="상회비 신규추가"
                    formData={formData}
                    setFormData={setFormData}
                    onSubmit={handleSubmitAdd}
                    onClose={() => setIsAddModalOpen(false)}
                    inspections={inspections}
                />
            )}
        </div>
    )
}

// Modal Component
function FeeModal({
    title,
    formData,
    setFormData,
    onSubmit,
    onClose,
    inspections
}: {
    title: string
    formData: any
    setFormData: (data: any) => void
    onSubmit: (e: React.FormEvent) => void
    onClose: () => void
    inspections: string[]
}) {
    // 숫자 포맷팅 함수 (콤마 추가)
    const formatNumber = (value: string) => {
        const num = value.replace(/[^0-9]/g, '')
        return num.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    }

    // 월회비 변경 핸들러 (연회비 자동 계산 포함)
    const handleMonthlyFeeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/[^0-9]/g, '')
        const formattedValue = formatNumber(rawValue)

        // 연회비 자동 계산 (월회비 * 12)
        const monthlyAmount = parseInt(rawValue || '0')
        const annualAmount = monthlyAmount * 12
        const formattedAnnual = formatNumber(annualAmount.toString())

        setFormData({
            ...formData,
            monthlyFee: formattedValue,
            annualFee: formattedAnnual
        })
    }

    // 연회비 변경 핸들러
    const handleAnnualFeeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formattedValue = formatNumber(e.target.value)
        setFormData({
            ...formData,
            annualFee: formattedValue
        })
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6 my-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{title}</h2>
                <form onSubmit={onSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">시찰 *</label>
                            <select
                                value={formData.inspection}
                                onChange={(e) => setFormData({ ...formData, inspection: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue"
                                required
                            >
                                {inspections.map(insp => (
                                    <option key={insp} value={insp}>{insp}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">교회명 *</label>
                            <input
                                type="text"
                                value={formData.churchName}
                                onChange={(e) => setFormData({ ...formData, churchName: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">담임목사</label>
                        <input
                            type="text"
                            value={formData.pastorName}
                            onChange={(e) => setFormData({ ...formData, pastorName: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">월회비</label>
                            <input
                                type="text"
                                value={formData.monthlyFee}
                                onChange={handleMonthlyFeeChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue"
                                placeholder="숫자만 입력"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">연회비 (자동계산)</label>
                            <input
                                type="text"
                                value={formData.annualFee}
                                onChange={handleAnnualFeeChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue"
                                placeholder="숫자만 입력"
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
