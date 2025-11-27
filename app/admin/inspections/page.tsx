'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface PersonInfo {
    name: string
    title: string
}

interface ChurchInfo {
    name: string
    pastor: string
    address: string
    phone?: string
    mobile?: string
    email?: string
}

interface InspectionData {
    id: string
    name: string
    leader: PersonInfo
    secretary: PersonInfo
    description: string
    churches: ChurchInfo[]
}

export default function AdminInspectionsPage() {
    const router = useRouter()
    const [inspections, setInspections] = useState<InspectionData[]>([])
    const [selectedInspectionId, setSelectedInspectionId] = useState<string>('dongbu')
    const [isLoading, setIsLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
    const [editingChurchIndex, setEditingChurchIndex] = useState<number>(-1)
    const [editFormData, setEditFormData] = useState<ChurchInfo>({
        name: '',
        pastor: '',
        address: '',
        phone: '',
        mobile: '',
        email: '',
    })

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const response = await fetch('/api/inspections')
            const data = await response.json()
            setInspections(data)
        } catch (error) {
            showMessage('error', '데이터를 불러오는데 실패했습니다.')
        }
    }

    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text })
        setTimeout(() => setMessage(null), 3000)
    }

    const selectedInspection = inspections.find((i) => i.id === selectedInspectionId)

    const handleInspectionInfoUpdate = async (field: 'leader' | 'secretary' | 'description', value: any) => {
        if (!selectedInspection) return

        const updatedInspections = inspections.map((inspection) =>
            inspection.id === selectedInspectionId
                ? { ...inspection, [field]: value }
                : inspection
        )

        await saveInspections(updatedInspections)
    }

    const handleAddChurch = () => {
        setEditingChurchIndex(-2) // -2 means adding new church
        setEditFormData({
            name: '',
            pastor: '',
            address: '',
            phone: '',
            mobile: '',
            email: '',
        })
    }

    const handleEditChurch = (index: number) => {
        if (!selectedInspection) return
        setEditingChurchIndex(index)
        setEditFormData({ ...selectedInspection.churches[index] })
    }

    const handleDeleteChurch = async (index: number) => {
        if (!selectedInspection) return
        if (!confirm('이 교회를 삭제하시겠습니까?')) return

        const updatedChurches = selectedInspection.churches.filter((_, i) => i !== index)
        const updatedInspections = inspections.map((inspection) =>
            inspection.id === selectedInspectionId
                ? { ...inspection, churches: updatedChurches }
                : inspection
        )

        await saveInspections(updatedInspections)
        showMessage('success', '교회가 삭제되었습니다.')
    }

    const handleSaveChurch = async () => {
        if (!selectedInspection) return

        // Validation
        if (!editFormData.name || !editFormData.pastor || !editFormData.address) {
            showMessage('error', '교회명, 담임목사, 주소는 필수 항목입니다.')
            return
        }

        let updatedChurches
        if (editingChurchIndex === -2) {
            // Adding new church
            updatedChurches = [...selectedInspection.churches, editFormData]
        } else {
            // Editing existing church
            updatedChurches = selectedInspection.churches.map((church, index) =>
                index === editingChurchIndex ? editFormData : church
            )
        }

        const updatedInspections = inspections.map((inspection) =>
            inspection.id === selectedInspectionId
                ? { ...inspection, churches: updatedChurches }
                : inspection
        )

        await saveInspections(updatedInspections)
        setEditingChurchIndex(-1)
        showMessage('success', editingChurchIndex === -2 ? '교회가 추가되었습니다.' : '교회 정보가 수정되었습니다.')
    }

    const handleCancelEdit = () => {
        setEditingChurchIndex(-1)
        setEditFormData({
            name: '',
            pastor: '',
            address: '',
            phone: '',
            mobile: '',
            email: '',
        })
    }

    const saveInspections = async (data: InspectionData[]) => {
        setIsLoading(true)
        try {
            const response = await fetch('/api/inspections', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            })

            if (!response.ok) throw new Error('Failed to save')

            setInspections(data)
            showMessage('success', '변경사항이 저장되었습니다.')
        } catch (error) {
            showMessage('error', '저장에 실패했습니다.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
            <div className="container-custom max-w-7xl">
                {/* Header */}
                <div className="bg-gradient-to-r from-brand-600 to-accent-600 text-white rounded-2xl p-8 mb-8">
                    <h1 className="text-4xl font-bold mb-2">시찰 관리</h1>
                    <p className="text-lg opacity-90">시찰별 교회 주소록을 관리합니다</p>
                </div>

                {/* Message Alert */}
                {message && (
                    <div
                        className={`mb-6 p-4 rounded-lg ${message.type === 'success'
                            ? 'bg-green-50 text-green-800 border border-green-200'
                            : 'bg-red-50 text-red-800 border border-red-200'
                            }`}
                    >
                        {message.text}
                    </div>
                )}

                {/* Inspection Tabs */}
                <div className="mb-8">
                    <div className="flex space-x-2 border-b border-gray-200">
                        {inspections.map((inspection) => (
                            <button
                                key={inspection.id}
                                onClick={() => setSelectedInspectionId(inspection.id)}
                                className={`px-6 py-3 font-semibold transition-all ${selectedInspectionId === inspection.id
                                    ? 'text-primary-blue border-b-2 border-primary-blue bg-blue-50'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                {inspection.name}
                            </button>
                        ))}
                    </div>
                </div>

                {selectedInspection && (
                    <div className="space-y-8">
                        {/* Inspection Info */}
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h2 className="text-2xl font-bold mb-6 text-gray-900">시찰 정보</h2>
                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Leader */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        시찰장
                                    </label>
                                    <div className="flex gap-3">
                                        <input
                                            type="text"
                                            value={selectedInspection.leader.name}
                                            onChange={(e) =>
                                                handleInspectionInfoUpdate('leader', {
                                                    ...selectedInspection.leader,
                                                    name: e.target.value,
                                                })
                                            }
                                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                                            placeholder="이름"
                                        />
                                        <input
                                            type="text"
                                            value={selectedInspection.leader.title}
                                            onChange={(e) =>
                                                handleInspectionInfoUpdate('leader', {
                                                    ...selectedInspection.leader,
                                                    title: e.target.value,
                                                })
                                            }
                                            className="w-24 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                                            placeholder="직책"
                                        />
                                    </div>
                                </div>

                                {/* Secretary */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        서기
                                    </label>
                                    <div className="flex gap-3">
                                        <input
                                            type="text"
                                            value={selectedInspection.secretary.name}
                                            onChange={(e) =>
                                                handleInspectionInfoUpdate('secretary', {
                                                    ...selectedInspection.secretary,
                                                    name: e.target.value,
                                                })
                                            }
                                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                                            placeholder="이름"
                                        />
                                        <input
                                            type="text"
                                            value={selectedInspection.secretary.title}
                                            onChange={(e) =>
                                                handleInspectionInfoUpdate('secretary', {
                                                    ...selectedInspection.secretary,
                                                    title: e.target.value,
                                                })
                                            }
                                            className="w-24 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                                            placeholder="직책"
                                        />
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        시찰 설명
                                    </label>
                                    <input
                                        type="text"
                                        value={selectedInspection.description}
                                        onChange={(e) =>
                                            handleInspectionInfoUpdate('description', e.target.value)
                                        }
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                                        placeholder="시찰 설명"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Churches Section */}
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    소속 교회 ({selectedInspection.churches.length}개)
                                </h2>
                                <button
                                    onClick={handleAddChurch}
                                    className="px-6 py-2 bg-primary-green text-white rounded-lg hover:bg-accent-600 transition-colors font-medium shadow-sm"
                                >
                                    + 교회 추가
                                </button>
                            </div>

                            {/* Add/Edit Church Form */}
                            {editingChurchIndex !== -1 && (
                                <div className="mb-6 p-6 bg-blue-50 rounded-lg border-2 border-primary-blue">
                                    <h3 className="text-lg font-semibold mb-4 text-gray-900">
                                        {editingChurchIndex === -2 ? '새 교회 추가' : '교회 정보 수정'}
                                    </h3>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                교회명 *
                                            </label>
                                            <input
                                                type="text"
                                                value={editFormData.name}
                                                onChange={(e) =>
                                                    setEditFormData({ ...editFormData, name: e.target.value })
                                                }
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue"
                                                placeholder="교회명"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                담임목사 *
                                            </label>
                                            <input
                                                type="text"
                                                value={editFormData.pastor}
                                                onChange={(e) =>
                                                    setEditFormData({ ...editFormData, pastor: e.target.value })
                                                }
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue"
                                                placeholder="담임목사"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                주소 *
                                            </label>
                                            <input
                                                type="text"
                                                value={editFormData.address}
                                                onChange={(e) =>
                                                    setEditFormData({ ...editFormData, address: e.target.value })
                                                }
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue"
                                                placeholder="주소"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                전화번호
                                            </label>
                                            <input
                                                type="text"
                                                value={editFormData.phone || ''}
                                                onChange={(e) =>
                                                    setEditFormData({ ...editFormData, phone: e.target.value })
                                                }
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue"
                                                placeholder="031-000-0000"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                휴대전화
                                            </label>
                                            <input
                                                type="text"
                                                value={editFormData.mobile || ''}
                                                onChange={(e) =>
                                                    setEditFormData({ ...editFormData, mobile: e.target.value })
                                                }
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue"
                                                placeholder="010-0000-0000"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                이메일
                                            </label>
                                            <input
                                                type="email"
                                                value={editFormData.email || ''}
                                                onChange={(e) =>
                                                    setEditFormData({ ...editFormData, email: e.target.value })
                                                }
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue"
                                                placeholder="email@example.com"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-3 mt-4">
                                        <button
                                            onClick={handleCancelEdit}
                                            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                                        >
                                            취소
                                        </button>
                                        <button
                                            onClick={handleSaveChurch}
                                            disabled={isLoading}
                                            className="px-6 py-2 bg-primary-blue text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                        >
                                            {isLoading ? '저장 중...' : '저장'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Churches List */}
                            <div className="space-y-4">
                                {selectedInspection.churches.map((church, index) => (
                                    <div
                                        key={index}
                                        className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                                                    {church.name}
                                                </h4>
                                                <div className="grid md:grid-cols-2 gap-2 text-sm text-gray-600">
                                                    <p>
                                                        <span className="font-medium">담임목사:</span>{' '}
                                                        {church.pastor} 목사
                                                    </p>
                                                    <p>
                                                        <span className="font-medium">주소:</span>{' '}
                                                        {church.address}
                                                    </p>
                                                    {church.phone && (
                                                        <p>
                                                            <span className="font-medium">전화:</span>{' '}
                                                            {church.phone}
                                                        </p>
                                                    )}
                                                    {church.mobile && (
                                                        <p>
                                                            <span className="font-medium">휴대전화:</span>{' '}
                                                            {church.mobile}
                                                        </p>
                                                    )}
                                                    {church.email && (
                                                        <p className="md:col-span-2">
                                                            <span className="font-medium">이메일:</span>{' '}
                                                            {church.email}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex gap-2 ml-4">
                                                <button
                                                    onClick={() => handleEditChurch(index)}
                                                    className="px-4 py-2 bg-primary-blue text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                                                >
                                                    수정
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteChurch(index)}
                                                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                                                >
                                                    삭제
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {selectedInspection.churches.length === 0 && (
                                    <div className="text-center py-12 text-gray-500">
                                        <p className="text-lg">등록된 교회가 없습니다.</p>
                                        <p className="text-sm mt-2">
                                            "교회 추가" 버튼을 클릭하여 첫 교회를 등록하세요.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Back Button */}
                        <div className="text-center">
                            <a
                                href="/about/inspections"
                                className="inline-flex items-center text-primary-blue hover:text-brand-700 font-medium transition-colors"
                            >
                                <svg
                                    className="w-5 h-5 mr-2"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                시찰소개 페이지 바로가기
                            </a>
                        </div>
                    </div>
                )}
            </div>
        </main>
    )
}
