'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface PresidentData {
    name: string
    title: string
    church: string
    term: string
    photo: string
    message: string[]
}

export default function AdminGreetingPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [dragActive, setDragActive] = useState(false)
    const [data, setData] = useState<PresidentData>({
        name: '',
        title: '',
        church: '',
        term: '',
        photo: '',
        message: [],
    })
    const [messageText, setMessageText] = useState('')
    const [previewUrl, setPreviewUrl] = useState('')

    useEffect(() => {
        fetchData()
    }, [])

    useEffect(() => {
        // Update preview when photo URL changes
        if (data.photo) {
            setPreviewUrl(data.photo)
        }
    }, [data.photo])

    const fetchData = async () => {
        try {
            const response = await fetch('/api/greeting')
            const result = await response.json()
            setData(result)
            setMessageText(result.message.join('\n\n'))
            setPreviewUrl(result.photo || '')
            setLoading(false)
        } catch (error) {
            alert('데이터 로드 실패')
            setLoading(false)
        }
    }

    const handleFileUpload = async (file: File) => {
        if (!file.type.startsWith('image/')) {
            alert('이미지 파일만 업로드 가능합니다.')
            return
        }

        if (file.size > 5 * 1024 * 1024) {
            alert('파일 크기는 5MB 이하여야 합니다.')
            return
        }

        setUploading(true)

        try {
            const formData = new FormData()
            formData.append('file', file)

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            })

            const result = await response.json()

            if (response.ok) {
                setData({ ...data, photo: result.photoUrl })
                setPreviewUrl(result.photoUrl)
                alert('✅ 파일 업로드 성공!')
            } else {
                alert('❌ 업로드 실패: ' + (result.error || '알 수 없는 오류'))
            }
        } catch (error) {
            alert('❌ 업로드 중 오류 발생')
        } finally {
            setUploading(false)
        }
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            handleFileUpload(file)
        }
    }

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true)
        } else if (e.type === 'dragleave') {
            setDragActive(false)
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)

        const file = e.dataTransfer.files?.[0]
        if (file) {
            handleFileUpload(file)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        const messageArray = messageText
            .split('\n\n')
            .map((p) => p.trim())
            .filter((p) => p.length > 0)

        const updatedData = {
            ...data,
            message: messageArray,
        }

        try {
            const response = await fetch('/api/greeting', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedData),
            })

            if (response.ok) {
                alert('✅ 성공적으로 저장되었습니다!')
                router.push('/about/greeting')
            } else {
                alert('❌ 저장 실패')
            }
        } catch (error) {
            alert('❌ 오류 발생')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue mx-auto mb-4"></div>
                    <p className="text-gray-600">데이터 로딩 중...</p>
                </div>
            </div>
        )
    }

    return (
        <main className="min-h-screen bg-gray-50 py-12">
            <div className="container-custom max-w-4xl">
                <div className="bg-white rounded-2xl shadow-lg p-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            노회장 정보 관리
                        </h1>
                        <p className="text-gray-600">
                            노회장님의 인사말과 정보를 수정할 수 있습니다.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Info */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    성함 *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={data.name}
                                    onChange={(e) => setData({ ...data, name: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                                    placeholder="예: 유병구"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    직책 *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={data.title}
                                    onChange={(e) => setData({ ...data, title: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                                    placeholder="예: 목사"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    소속 교회 *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={data.church}
                                    onChange={(e) =>
                                        setData({ ...data, church: e.target.value })
                                    }
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                                    placeholder="예: 사랑하는교회"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    회기 *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={data.term}
                                    onChange={(e) => setData({ ...data, term: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                                    placeholder="예: 제 48-49회기"
                                />
                            </div>
                        </div>

                        {/* Photo Upload with Drag & Drop */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                사진 업로드
                            </label>

                            {/* Drag & Drop Area */}
                            <div
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                                className={`
                  relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
                  ${dragActive
                                        ? 'border-primary-blue bg-blue-50'
                                        : 'border-gray-300 bg-gray-50'
                                    }
                  ${uploading ? 'opacity-50 pointer-events-none' : ''}
                `}
                            >
                                {uploading ? (
                                    <div className="py-8">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue mx-auto mb-4"></div>
                                        <p className="text-gray-600">업로드 중...</p>
                                    </div>
                                ) : (
                                    <>
                                        {/* Preview */}
                                        {previewUrl && (
                                            <div className="mb-4">
                                                <div className="w-32 h-40 mx-auto rounded-full overflow-hidden shadow-lg ring-4 ring-gray-200/50">
                                                    <img
                                                        src={previewUrl}
                                                        alt="Preview"
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        <svg
                                            className="w-16 h-16 mx-auto text-gray-400 mb-4"
                                            fill="none"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>

                                        <p className="text-gray-700 font-medium mb-2">
                                            이미지를 드래그 &amp; 드롭하거나
                                        </p>

                                        <label className="inline-block px-6 py-3 bg-primary-blue text-white rounded-lg font-semibold hover:bg-brand-700 transition-colors cursor-pointer">
                                            파일 선택
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileSelect}
                                                className="hidden"
                                            />
                                        </label>

                                        <p className="text-sm text-gray-500 mt-4">
                                            JPG, PNG, GIF 등 (최대 5MB)
                                        </p>
                                    </>
                                )}
                            </div>

                            {/* Current Photo URL (read-only) */}
                            {data.photo && (
                                <div className="mt-4">
                                    <label className="block text-xs font-medium text-gray-500 mb-1">
                                        현재 사진 경로
                                    </label>
                                    <input
                                        type="text"
                                        value={data.photo}
                                        readOnly
                                        className="w-full px-3 py-2 border border-gray-200 rounded bg-gray-50 text-sm text-gray-600"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Message */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                인사말 *
                            </label>
                            <textarea
                                required
                                value={messageText}
                                onChange={(e) => setMessageText(e.target.value)}
                                rows={20}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent font-mono text-sm"
                                placeholder="각 문단을 빈 줄로 구분하여 입력하세요.&#10;&#10;첫 번째 문단&#10;&#10;두 번째 문단&#10;&#10;세 번째 문단"
                            />
                            <p className="text-sm text-gray-500 mt-2">
                                💡 문단을 구분하려면 두 번의 엔터(빈 줄)를 입력하세요.
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4 pt-6 border-t">
                            <button
                                type="submit"
                                disabled={saving || uploading}
                                className="flex-1 px-6 py-3 bg-primary-blue text-white rounded-lg font-semibold hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {saving ? '저장 중...' : '✅ 저장하기'}
                            </button>
                            <a
                                href="/about/greeting"
                                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors text-center"
                            >
                                취소
                            </a>
                        </div>
                    </form>
                </div>

                {/* Instructions */}
                <div className="mt-8 bg-blue-50 border-l-4 border-primary-blue p-6 rounded-lg">
                    <h3 className="font-bold text-gray-900 mb-3">📌 사용 안내</h3>
                    <ul className="space-y-2 text-sm text-gray-700">
                        <li>• 모든 필수 항목(*)을 입력한 후 "저장하기"를 클릭하세요.</li>
                        <li>
                            • 인사말은 문단별로 빈 줄(두 번의 엔터)로 구분하여 입력합니다.
                        </li>
                        <li>
                            • 사진 업로드: 드래그 &amp; 드롭하거나 "파일 선택" 버튼으로
                            업로드
                        </li>
                        <li>• 업로드된 이미지는 즉시 미리보기로 확인할 수 있습니다.</li>
                        <li>• 저장 후 자동으로 노회장 인사 페이지로 이동합니다.</li>
                    </ul>
                </div>

                {/* Back Button */}
                <div className="mt-8 text-center">
                    <a
                        href="/about/greeting"
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
                        노회장인사 페이지 바로가기
                    </a>
                </div>
            </div>
        </main >
    )
}
