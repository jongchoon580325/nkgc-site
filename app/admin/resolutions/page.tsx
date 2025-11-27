'use client'

import { useState, useEffect } from 'react'

interface Resolution {
    id: number
    tabType: string
    meetingNum: number
    sessionNum: number | null
    meetingType: string
    title: string
    fileType: string
    fileName: string
    fileUrl: string
}

export default function ResolutionsAdminPage() {
    const [activeTab, setActiveTab] = useState<'1-20' | '21-40' | '41-60' | '61-80'>('1-20')
    const [resolutions, setResolutions] = useState<Resolution[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [showUploadForm, setShowUploadForm] = useState(false)
    const [editingId, setEditingId] = useState<number | null>(null)
    const [uploadForm, setUploadForm] = useState({
        meetingNum: '',
        sessionNum: '',
        meetingType: '정기' as '정기' | '임시',
        title: '',
        file: null as File | null
    })
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    useEffect(() => {
        fetchResolutions(activeTab)
    }, [activeTab])

    // 제목 자동 생성
    useEffect(() => {
        if (uploadForm.meetingNum) {
            const title = generateTitle(
                parseInt(uploadForm.meetingNum),
                uploadForm.meetingType,
                uploadForm.sessionNum ? parseInt(uploadForm.sessionNum) : null
            )
            setUploadForm(prev => ({ ...prev, title }))
        }
    }, [uploadForm.meetingNum, uploadForm.sessionNum, uploadForm.meetingType])

    const generateTitle = (meetingNum: number, meetingType: string, sessionNum: number | null): string => {
        if (meetingType === '정기') {
            return `제${meetingNum}회 정기노회 결의서`
        } else {
            if (sessionNum) {
                return `제${meetingNum}회 제${sessionNum}차 임시노회 결의서`
            }
            return `제${meetingNum}회 임시노회 결의서`
        }
    }

    const fetchResolutions = async (tab: string) => {
        setIsLoading(true)
        try {
            const response = await fetch(`/api/resolutions?tab=${tab}`)
            const result = await response.json()
            if (result.success) {
                setResolutions(result.data)
            } else {
                setResolutions([])
            }
        } catch (error) {
            console.error('Failed to fetch resolutions:', error)
            setResolutions([])
        } finally {
            setIsLoading(false)
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setUploadForm({ ...uploadForm, file: e.target.files[0] })
        }
    }

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!uploadForm.file || !uploadForm.meetingNum) {
            showMessage('error', '모든 항목을 입력해주세요.')
            return
        }

        if (uploadForm.meetingType === '임시' && !uploadForm.sessionNum) {
            showMessage('error', '임시회의인 경우 회기를 입력해주세요.')
            return
        }

        const formData = new FormData()
        formData.append('file', uploadForm.file)
        formData.append('tabType', activeTab)
        formData.append('meetingNum', uploadForm.meetingNum)
        formData.append('meetingType', uploadForm.meetingType)
        if (uploadForm.sessionNum) {
            formData.append('sessionNum', uploadForm.sessionNum)
        }
        formData.append('title', uploadForm.title)

        try {
            const response = await fetch('/api/admin/resolutions', {
                method: 'POST',
                body: formData
            })
            const result = await response.json()

            if (result.success) {
                showMessage('success', '업로드되었습니다.')
                setUploadForm({ meetingNum: '', sessionNum: '', meetingType: '정기', title: '', file: null })
                setShowUploadForm(false)
                fetchResolutions(activeTab)
            } else {
                showMessage('error', result.error || '업로드에 실패했습니다.')
            }
        } catch (error) {
            console.error('Upload failed:', error)
            showMessage('error', '업로드 중 오류가 발생했습니다.')
        }
    }

    const handleEdit = (resolution: Resolution) => {
        setEditingId(resolution.id)
        setUploadForm({
            meetingNum: resolution.meetingNum.toString(),
            sessionNum: resolution.sessionNum?.toString() || '',
            meetingType: resolution.meetingType as '정기' | '임시',
            title: resolution.title,
            file: null
        })
        setShowUploadForm(true)
    }

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!editingId || !uploadForm.meetingNum) {
            showMessage('error', '모든 항목을 입력해주세요.')
            return
        }

        if (uploadForm.meetingType === '임시' && !uploadForm.sessionNum) {
            showMessage('error', '임시회의인 경우 회기를 입력해주세요.')
            return
        }

        const formData = new FormData()
        formData.append('id', editingId.toString())
        formData.append('meetingNum', uploadForm.meetingNum)
        formData.append('meetingType', uploadForm.meetingType)
        if (uploadForm.sessionNum) {
            formData.append('sessionNum', uploadForm.sessionNum)
        }
        formData.append('title', uploadForm.title)
        if (uploadForm.file) {
            formData.append('file', uploadForm.file)
        }

        try {
            const response = await fetch('/api/admin/resolutions', {
                method: 'PUT',
                body: formData
            })
            const result = await response.json()

            if (result.success) {
                showMessage('success', '수정되었습니다.')
                setUploadForm({ meetingNum: '', sessionNum: '', meetingType: '정기', title: '', file: null })
                setShowUploadForm(false)
                setEditingId(null)
                fetchResolutions(activeTab)
            } else {
                showMessage('error', result.error || '수정에 실패했습니다.')
            }
        } catch (error) {
            console.error('Update failed:', error)
            showMessage('error', '수정 중 오류가 발생했습니다.')
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm('정말 삭제하시겠습니까?')) return

        try {
            const response = await fetch(`/api/admin/resolutions?id=${id}`, {
                method: 'DELETE'
            })
            const result = await response.json()

            if (result.success) {
                showMessage('success', '삭제되었습니다.')
                fetchResolutions(activeTab)
            } else {
                showMessage('error', result.error || '삭제에 실패했습니다.')
            }
        } catch (error) {
            console.error('Delete failed:', error)
            showMessage('error', '삭제 중 오류가 발생했습니다.')
        }
    }

    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text })
        setTimeout(() => setMessage(null), 3000)
    }

    const tabs = [
        { key: '1-20' as const, label: '제1회 ~ 제20회' },
        { key: '21-40' as const, label: '제21회 ~ 제40회' },
        { key: '41-60' as const, label: '제41회 ~ 제60회' },
        { key: '61-80' as const, label: '제61회 ~ 제80회' }
    ]

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">결의서 관리</h1>
                    <p className="mt-1 text-sm text-gray-600">노회 결의서를 관리합니다.</p>
                </div>
                {!showUploadForm && (
                    <button
                        onClick={() => setShowUploadForm(true)}
                        className="px-6 py-2 bg-primary-blue text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-md"
                    >
                        + 새 결의서 업로드
                    </button>
                )}
            </div>

            {message && (
                <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                    {message.text}
                </div>
            )}

            {/* Upload Form */}
            {showUploadForm && (
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold mb-4">
                        {editingId ? '결의서 수정' : '새 결의서 업로드'}
                    </h3>
                    <form onSubmit={editingId ? handleUpdate : handleUpload} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    정기회의 회기 (필수)
                                </label>
                                <input
                                    type="number"
                                    value={uploadForm.meetingNum}
                                    onChange={(e) => setUploadForm({ ...uploadForm, meetingNum: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                                    placeholder="1"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    회의 종류 (필수)
                                </label>
                                <select
                                    value={uploadForm.meetingType}
                                    onChange={(e) => setUploadForm({ ...uploadForm, meetingType: e.target.value as '정기' | '임시' })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                                >
                                    <option value="정기">정기</option>
                                    <option value="임시">임시</option>
                                </select>
                            </div>
                        </div>

                        {uploadForm.meetingType === '임시' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    임시회의 회기 (임시인 경우 필수)
                                </label>
                                <input
                                    type="number"
                                    value={uploadForm.sessionNum}
                                    onChange={(e) => setUploadForm({ ...uploadForm, sessionNum: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                                    placeholder="1"
                                    required={uploadForm.meetingType === '임시'}
                                />
                            </div>
                        )}

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                생성될 제목 (자동)
                            </label>
                            <div className="text-base font-semibold text-gray-900">
                                {uploadForm.title || '위 항목을 입력하면 제목이 자동 생성됩니다'}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                파일 (JPG, PNG, PDF) {editingId && '- 변경하지 않으려면 비워두세요'}
                            </label>
                            <input
                                type="file"
                                accept=".jpg,.jpeg,.png,.pdf"
                                onChange={handleFileChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                                key={uploadForm.file ? 'file-selected' : 'no-file'}
                            />
                            {uploadForm.file && (
                                <p className="mt-1 text-sm text-gray-600">
                                    선택된 파일: {uploadForm.file.name}
                                </p>
                            )}
                        </div>
                        <div className="flex gap-3">
                            <button
                                type="submit"
                                className="px-6 py-2 bg-primary-blue text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                            >
                                {editingId ? '수정' : '저장'}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowUploadForm(false)
                                    setEditingId(null)
                                    setUploadForm({ meetingNum: '', sessionNum: '', meetingType: '정기', title: '', file: null })
                                }}
                                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                            >
                                취소
                            </button>
                        </div>
                    </form>
                </div >
            )
            }

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="border-b border-gray-200">
                    <nav className="flex -mb-px">
                        {tabs.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`flex-1 py-4 px-6 text-center font-semibold transition-all duration-200 ${activeTab === tab.key
                                    ? 'border-b-2 border-primary-blue text-primary-blue bg-blue-50'
                                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Table */}
                <div className="p-6">
                    {isLoading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue"></div>
                        </div>
                    ) : resolutions.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            등록된 결의서가 없습니다.
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-100 border-b">
                                    <th className="px-6 py-4 text-left font-bold text-gray-700">회기</th>
                                    <th className="px-6 py-4 text-left font-bold text-gray-700">제목</th>
                                    <th className="px-6 py-4 text-left font-bold text-gray-700">파일 타입</th>
                                    <th className="px-6 py-4 text-center font-bold text-gray-700">액션</th>
                                </tr>
                            </thead>
                            <tbody>
                                {resolutions.map((resolution) => (
                                    <tr key={resolution.id} className="border-b hover:bg-gray-50">
                                        <td className="px-6 py-4 font-semibold text-gray-900">
                                            {resolution.meetingNum}회
                                        </td>
                                        <td className="px-6 py-4 text-gray-800">
                                            {resolution.title}
                                        </td>
                                        <td className="px-6 py-4 text-gray-800">
                                            <span className={`px-3 py-1 rounded-full text-sm ${resolution.fileType === 'PDF' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                                                {resolution.fileType}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex justify-center gap-2">
                                                <a
                                                    href={resolution.fileUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                                                >
                                                    보기
                                                </a>
                                                <button
                                                    onClick={() => handleEdit(resolution)}
                                                    className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                                                >
                                                    수정
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(resolution.id)}
                                                    className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                                                >
                                                    삭제
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div >
    )
}
