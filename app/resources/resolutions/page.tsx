'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import PageHeader from '@/app/components/common/PageHeader'

interface Resolution {
    id: number
    tabType: string
    meetingNum: number
    title: string
    fileType: string
    fileName: string
    fileUrl: string
}

export default function ResolutionsPage() {
    const [activeTab, setActiveTab] = useState<'1-20' | '21-40' | '41-60' | '61-80'>('1-20')
    const [resolutions, setResolutions] = useState<Resolution[]>([])
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        fetchResolutions(activeTab)
    }, [activeTab])

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

    const tabs = [
        { key: '1-20' as const, label: '제1회 ~ 제20회' },
        { key: '21-40' as const, label: '제21회 ~ 제40회' },
        { key: '41-60' as const, label: '제41회 ~ 제60회' },
        { key: '61-80' as const, label: '제61회 ~ 제80회' }
    ]

    return (
        <main className="min-h-screen bg-gray-50">
            <PageHeader title="결의서자료실" />

            {/* Content Section */}
            <section className="section-padding">
                <div className="container-custom max-w-6xl">
                    {/* Tab Navigation */}
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
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

                        {/* Tab Content */}
                        <div className="p-8 min-h-[400px]">
                            {isLoading ? (
                                <div className="flex justify-center items-center py-12">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue"></div>
                                </div>
                            ) : resolutions.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    등록된 결의서가 없습니다.
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {resolutions.map((resolution) => (
                                        <div key={resolution.id} className="border-b border-gray-200 pb-6 last:border-0">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                                {resolution.title}
                                            </h3>

                                            {resolution.fileType === 'IMAGE' ? (
                                                <div className="relative w-full max-w-2xl">
                                                    <Image
                                                        src={resolution.fileUrl}
                                                        alt={resolution.title}
                                                        width={800}
                                                        height={1000}
                                                        className="w-full h-auto rounded-lg shadow-md"
                                                    />
                                                </div>
                                            ) : (
                                                <a
                                                    href={resolution.fileUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary-blue text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                    결의서 보기
                                                </a>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </main>
    )
}
