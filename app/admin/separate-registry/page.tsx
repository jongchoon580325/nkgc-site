'use client'

import { useState, useEffect } from 'react'

interface SeparateRegistry {
    id: number
    name: string
    position: string
    birthDate: string
    registrationDate: string
    registrationReason: string
    cancellationDate: string
    cancellationReason: string
}

export default function SeparateRegistryAdminPage() {
    const [registries, setRegistries] = useState<SeparateRegistry[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    // Modal states
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [selectedRegistry, setSelectedRegistry] = useState<SeparateRegistry | null>(null)

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        position: '',
        birthDate: '',
        registrationDate: '',
        registrationReason: '',
        cancellationDate: '',
        cancellationReason: ''
    })

    useEffect(() => {
        fetchRegistries()
    }, [])

    const fetchRegistries = async () => {
        try {
            setIsLoading(true)
            const response = await fetch('/api/admin/separate-registry')
            const result = await response.json()

            if (result.success) {
                setRegistries(result.data)
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

    const handleEdit = (registry: SeparateRegistry) => {
        setSelectedRegistry(registry)
        setFormData({
            name: registry.name,
            position: registry.position,
            birthDate: registry.birthDate,
            registrationDate: registry.registrationDate,
            registrationReason: registry.registrationReason,
            cancellationDate: registry.cancellationDate,
            cancellationReason: registry.cancellationReason
        })
        setIsEditModalOpen(true)
    }

    const handleAdd = () => {
        setFormData({
            name: '',
            position: '목사',
            birthDate: '',
            registrationDate: '',
            registrationReason: '',
            cancellationDate: '',
            cancellationReason: ''
        })
        setIsAddModalOpen(true)
    }

    const handleSubmitEdit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedRegistry) return

        try {
            const response = await fetch(`/api/admin/separate-registry/${selectedRegistry.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            const result = await response.json()

            if (result.success) {
                showMessage('success', '별명부 정보가 수정되었습니다.')
                setIsEditModalOpen(false)
                fetchRegistries()
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
            const response = await fetch('/api/admin/separate-registry', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            const result = await response.json()

            if (result.success) {
                showMessage('success', '별명부가 추가되었습니다.')
                setIsAddModalOpen(false)
                fetchRegistries()
            } else {
                showMessage('error', result.error || '추가에 실패했습니다.')
            }
        } catch (err) {
            showMessage('error', '추가 중 오류가 발생했습니다.')
        }
    }

    const handleDelete = async (registry: SeparateRegistry) => {
        if (!confirm(`${registry.name}님을 정말 삭제하시겠습니까?`)) {
            return
        }

        try {
            const response = await fetch(`/api/admin/separate-registry/${registry.id}`, {
                method: 'DELETE'
            })

            const result = await response.json()

            if (result.success) {
                showMessage('success', '삭제되었습니다.')
                fetchRegistries()
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
                    <h1 className="text-3xl font-bold text-gray-900">별명부 관리</h1>
                    <p className="mt-1 text-sm text-gray-600">별명부 정보를 관리합니다</p>
                </div>
                <button
                    onClick={handleAdd}
                    className="px-6 py-3 bg-primary-blue text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-md flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    신규추가
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

            {/* Registry List */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-bold text-gray-900">
                        별명부 목록 ({registries.length}명)
                    </h2>
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue"></div>
                    </div>
                ) : registries.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500">등록된 데이터가 없습니다.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이름</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">직분</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">생년월일</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">등재일자</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">해지일자</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">작업</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {registries.map((registry) => (
                                    <tr key={registry.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{registry.name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{registry.position}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500">{registry.birthDate}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500">{registry.registrationDate}</div>
                                            <div className="text-xs text-gray-400">{registry.registrationReason}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500">{registry.cancellationDate}</div>
                                            <div className="text-xs text-gray-400">{registry.cancellationReason}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => handleEdit(registry)}
                                                className="text-primary-blue hover:text-blue-700 mr-4"
                                            >
                                                수정
                                            </button>
                                            <button
                                                onClick={() => handleDelete(registry)}
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
                <RegistryModal
                    title="별명부 정보 수정"
                    formData={formData}
                    setFormData={setFormData}
                    onSubmit={handleSubmitEdit}
                    onClose={() => setIsEditModalOpen(false)}
                />
            )}

            {/* Add Modal */}
            {isAddModalOpen && (
                <RegistryModal
                    title="별명부 신규추가"
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
function RegistryModal({
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">이름 *</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">직분 *</label>
                            <input
                                type="text"
                                value={formData.position}
                                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">생년월일</label>
                        <input
                            type="text"
                            value={formData.birthDate}
                            onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue"
                            placeholder="예: 1900년 1월 1일"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">등재일자</label>
                            <input
                                type="text"
                                value={formData.registrationDate}
                                onChange={(e) => setFormData({ ...formData, registrationDate: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue"
                                placeholder="예: 2001년 1월 1일"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">등재사유</label>
                            <input
                                type="text"
                                value={formData.registrationReason}
                                onChange={(e) => setFormData({ ...formData, registrationReason: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">해지일자</label>
                            <input
                                type="text"
                                value={formData.cancellationDate}
                                onChange={(e) => setFormData({ ...formData, cancellationDate: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue"
                                placeholder="예: 2010년 1월 1일"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">해지사유</label>
                            <input
                                type="text"
                                value={formData.cancellationReason}
                                onChange={(e) => setFormData({ ...formData, cancellationReason: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue"
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
