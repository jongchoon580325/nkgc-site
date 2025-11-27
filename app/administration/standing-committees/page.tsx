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

export default function StandingCommitteesPage() {
    const [committees, setCommittees] = useState<StandingCommittee[]>([])
    const [currentTerm, setCurrentTerm] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true)

                // Fetch term setting
                const termResponse = await fetch('/api/admin/settings?key=current_term')
                const termResult = await termResponse.json()
                if (termResult.success && termResult.data) {
                    setCurrentTerm(termResult.data.value)
                }

                // Fetch committees
                const response = await fetch('/api/administration/standing-committees')
                const result = await response.json()

                if (result.success) {
                    setCommittees(result.data)
                } else {
                    setError(result.error || '데이터를 불러올 수 없습니다.')
                }
            } catch (err) {
                setError('데이터를 불러오는 중 오류가 발생했습니다.')
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [])

    return (
        <main className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <section className="bg-gradient-to-r from-brand-600 to-accent-600 text-white py-16">
                <div className="container-custom">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">상비부현황</h1>
                    <p className="text-xl opacity-90">대한예수교 장로회 남경기노회</p>
                </div>
            </section>

            {/* Term Info */}
            {currentTerm && (
                <section className="py-8 bg-white border-b border-gray-200">
                    <div className="container-custom max-w-6xl">
                        <div className="flex items-center justify-center gap-3 text-gray-700">
                            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-4xl font-bold">{currentTerm}</span>
                        </div>
                    </div>
                </section>
            )}

            {/* Content Section */}
            <section className="section-padding">
                <div className="container-custom max-w-7xl">
                    {isLoading ? (
                        <div className="flex justify-center items-center py-20">
                            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-blue"></div>
                        </div>
                    ) : error ? (
                        <div className="text-center py-20">
                            <p className="text-red-600 text-lg">{error}</p>
                        </div>
                    ) : committees.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="text-gray-500 text-lg">등록된 상비부가 없습니다.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {committees.map((committee) => (
                                <div
                                    key={committee.id}
                                    className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-100"
                                >
                                    {/* Committee Header */}
                                    <div className="bg-gradient-to-r from-primary-blue to-accent-600 text-white px-6 py-4">
                                        <h3 className="text-xl font-bold text-center">{committee.name}</h3>
                                    </div>

                                    {/* Committee Body */}
                                    <div className="p-6 space-y-4">
                                        {/* Head */}
                                        <div className="flex items-start gap-3">
                                            <div className="flex-shrink-0 w-16">
                                                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded">
                                                    {committee.headTitle}
                                                </span>
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-gray-900 font-medium">
                                                    {committee.head}
                                                    <span className="text-gray-600 text-sm ml-2">{committee.headRole}</span>
                                                </p>
                                            </div>
                                        </div>

                                        {/* Secretary */}
                                        <div className="flex items-start gap-3">
                                            <div className="flex-shrink-0 w-16">
                                                <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded">
                                                    서기
                                                </span>
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-gray-900 font-medium">
                                                    {committee.secretary}
                                                    <span className="text-gray-600 text-sm ml-2">{committee.secretaryRole}</span>
                                                </p>
                                            </div>
                                        </div>

                                        {/* Members */}
                                        {committee.members && (
                                            <div className="pt-3 border-t border-gray-200">
                                                <p className="text-sm font-semibold text-gray-700 mb-2">위원</p>
                                                <p className="text-sm text-gray-600 leading-relaxed">
                                                    {committee.members}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Total Count */}
                    {committees.length > 0 && (
                        <div className="mt-12 text-center">
                            <p className="text-gray-600">
                                총 <span className="font-bold text-primary-blue text-lg">{committees.length}</span>개의 상비부
                            </p>
                        </div>
                    )}
                </div>
            </section>
        </main>
    )
}
