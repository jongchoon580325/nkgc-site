'use client'

import { useState } from 'react'

export default function AdminOrganizationsPage() {
    const organizations = [
        { id: 'mens', name: '남전도회', publicUrl: '/organizations/mens' },
        { id: 'womens', name: '여전도회', publicUrl: '/organizations/womens' },
        { id: 'sunday-school', name: '주교연합회', publicUrl: '/organizations/sunday-school' },
        { id: 'student', name: '학생면려회', publicUrl: '/organizations/student' },
        { id: 'young-adult', name: '청장년면려회', publicUrl: '/organizations/young-adult' },
    ]

    const [activeTab, setActiveTab] = useState(organizations[0].id)

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="bg-white rounded-xl shadow-md p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">기관 관리</h1>
                <p className="text-gray-600">노회 기관들의 정보를 관리합니다</p>
            </div>

            {/* Tab Navigation */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="flex border-b border-gray-200 overflow-x-auto">
                    {organizations.map((org) => (
                        <button
                            key={org.id}
                            onClick={() => setActiveTab(org.id)}
                            className={`flex-1 min-w-[120px] px-6 py-4 font-semibold transition-colors whitespace-nowrap ${activeTab === org.id
                                    ? 'bg-primary-blue text-white border-b-2 border-primary-blue'
                                    : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            {org.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-xl shadow-md p-6">
                {organizations.map((org) => (
                    <div key={org.id} className={activeTab === org.id ? 'block' : 'hidden'}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">{org.name} 정보 관리</h2>
                            <a
                                href={`/admin/organizations/${org.id}`}
                                className="px-6 py-3 bg-primary-blue text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                편집하기
                            </a>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                <p className="text-sm text-gray-600">
                                    '{org.name}' 페이지의 회장, 서기, 임원 현황, 중요 행사 등을 편집할 수 있습니다.
                                </p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <a
                                    href={org.publicUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <span className="font-medium text-gray-900">공개 페이지 보기</span>
                                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                </a>

                                <a
                                    href={`/admin/organizations/${org.id}`}
                                    className="flex items-center justify-between p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <span className="font-medium text-gray-900">관리 페이지로 이동</span>
                                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Help Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    사용 안내
                </h3>
                <ul className="text-sm text-blue-800 space-y-1 ml-7">
                    <li>• 각 기관의 탭을 선택하여 정보를 확인하고 편집할 수 있습니다</li>
                    <li>• '편집하기' 버튼을 클릭하여 세부 정보를 수정할 수 있습니다</li>
                    <li>• CSV 일괄 등록은 '데이터 관리' 메뉴에서 가능합니다</li>
                </ul>
            </div>
        </div>
    )
}
