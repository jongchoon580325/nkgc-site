'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { marked } from 'marked'
import 'react-quill-new/dist/quill.snow.css'

// Dynamic import for ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill-new'), {
    ssr: false,
    loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-lg"></div>,
})

export default function RulesAdminPage() {
    const [activeTab, setActiveTab] = useState<'PRESBYTERY' | 'COURTESY'>('PRESBYTERY')
    const [content, setContent] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    useEffect(() => {
        fetchRule(activeTab)
    }, [activeTab])

    const fetchRule = async (type: string) => {
        setIsLoading(true)
        try {
            const response = await fetch(`/api/admin/rules?type=${type}`)
            const result = await response.json()
            if (result.success && result.data) {
                setContent(result.data.content)
            } else {
                setContent('')
            }
        } catch (error) {
            console.error('Failed to fetch rule:', error)
            showMessage('error', '데이터를 불러오는데 실패했습니다.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const fileExtension = file.name.split('.').pop()?.toLowerCase()

        if (!['md', 'html', 'htm'].includes(fileExtension || '')) {
            showMessage('error', 'MD 또는 HTML 파일만 업로드 가능합니다.')
            return
        }

        try {
            const text = await file.text()

            if (fileExtension === 'md') {
                // Markdown to HTML conversion
                const htmlContent = marked(text)
                setContent(htmlContent as string)
                showMessage('success', 'Markdown 파일이 변환되어 에디터에 삽입되었습니다.')
            } else {
                // HTML file
                setContent(text)
                showMessage('success', 'HTML 파일이 에디터에 삽입되었습니다.')
            }
        } catch (error) {
            console.error('Failed to read file:', error)
            showMessage('error', '파일을 읽는 중 오류가 발생했습니다.')
        }

        // Reset input
        e.target.value = ''
    }

    const handleSave = async () => {
        if (!content || content.trim() === '' || content === '<p><br></p>') {
            showMessage('error', '내용을 입력해주세요.')
            return
        }

        setIsSaving(true)
        try {
            const response = await fetch('/api/admin/rules', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: activeTab,
                    content
                })
            })

            const result = await response.json()

            if (result.success) {
                showMessage('success', '저장되었습니다.')
            } else {
                console.error('Save failed:', result)
                showMessage('error', result.error || '저장에 실패했습니다.')
            }
        } catch (error) {
            console.error('Failed to save rule:', error)
            showMessage('error', '저장 중 오류가 발생했습니다.')
        } finally {
            setIsSaving(false)
        }
    }

    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text })
        setTimeout(() => setMessage(null), 3000)
    }

    const modules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'align': [] }],
            ['clean']
        ],
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">규칙 관리</h1>
                    <p className="mt-1 text-sm text-gray-600">노회 규칙 및 예우 규칙을 관리합니다.</p>
                </div>
                <div className="flex gap-3">
                    {/* File Upload Button */}
                    <label className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold shadow-md cursor-pointer flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        파일 불러오기
                        <input
                            type="file"
                            accept=".md,.html,.htm"
                            onChange={handleFileUpload}
                            className="hidden"
                        />
                    </label>
                    {/* Save Button */}
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-6 py-2 bg-primary-blue text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-md disabled:opacity-50"
                    >
                        {isSaving ? '저장 중...' : '저장하기'}
                    </button>
                </div>
            </div>

            {message && (
                <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                    {message.text}
                </div>
            )}

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="border-b border-gray-200">
                    <nav className="flex -mb-px">
                        <button
                            onClick={() => setActiveTab('PRESBYTERY')}
                            className={`py-4 px-6 text-center border-b-2 font-medium text-sm transition-colors ${activeTab === 'PRESBYTERY'
                                ? 'border-primary-blue text-primary-blue'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            노회 규칙
                        </button>
                        <button
                            onClick={() => setActiveTab('COURTESY')}
                            className={`py-4 px-6 text-center border-b-2 font-medium text-sm transition-colors ${activeTab === 'COURTESY'
                                ? 'border-primary-blue text-primary-blue'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            예우 규칙
                        </button>
                    </nav>
                </div>

                <div className="p-6">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue"></div>
                        </div>
                    ) : (
                        <div className="h-[600px]">
                            <ReactQuill
                                theme="snow"
                                value={content}
                                onChange={setContent}
                                modules={modules}
                                className="h-[550px]"
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
