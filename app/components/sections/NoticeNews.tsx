'use client'

import { useState } from 'react'

interface Notice {
    id: number
    category: '노회공지' | '자립위원회' | '정회원전용'
    title: string
    date: string
    summary: string
}

// Dummy data - will be replaced with actual API calls
const dummyNotices: Notice[] = [
    {
        id: 1,
        category: '노회공지',
        title: '제 49회 정기노회 개최 안내',
        date: '2024-03-15',
        summary:
            '2024년 제 49회 정기노회가 4월 10일 오전 10시에 개최됩니다.',
    },
    {
        id: 2,
        category: '자립위원회',
        title: '2024년 자립교회 지원 사업 공고',
        date: '2024-03-10',
        summary: '미자립교회 지원을 위한 2024년 사업 계획을 안내드립니다.',
    },
    {
        id: 3,
        category: '노회공지',
        title: '노회 상회비 납부 안내',
        date: '2024-03-05',
        summary: '2024년도 상회비 납부 기한 및 계좌 안내입니다.',
    },
    {
        id: 4,
        category: '정회원전용',
        title: '정회원 총회 개최 안내',
        date: '2024-03-01',
        summary: '정회원 총회가 3월 25일에 개최됩니다.',
    },
]

const categoryColors = {
    노회공지: 'bg-blue-100 text-blue-800',
    자립위원회: 'bg-green-100 text-green-800',
    정회원전용: 'bg-purple-100 text-purple-800',
}

export default function NoticeNews() {
    const [activeCategory, setActiveCategory] = useState<string>('전체')
    const categories = ['전체', '노회공지', '자립위원회', '정회원전용']

    const filteredNotices =
        activeCategory === '전체'
            ? dummyNotices
            : dummyNotices.filter((notice) => notice.category === activeCategory)

    return (
        <div className="h-full">
            <div className="mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                    노회 공지 & 소식
                </h2>
                <p className="text-gray-600">
                    노회의 최신 소식과 공지사항을 확인하세요
                </p>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 mb-6">
                {categories.map((category) => (
                    <button
                        key={category}
                        onClick={() => setActiveCategory(category)}
                        className={`px-4 py-2 rounded-full font-medium text-sm transition-all duration-300 ${activeCategory === category
                                ? 'bg-primary-blue text-white shadow-md'
                                : 'bg-white text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        {category}
                    </button>
                ))}
            </div>

            {/* Notices List */}
            <div className="space-y-4 mb-6">
                {filteredNotices.slice(0, 3).map((notice) => (
                    <div
                        key={notice.id}
                        className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100"
                    >
                        <div className="flex flex-col mb-2">
                            <div className="flex items-center gap-2 mb-1">
                                <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${categoryColors[notice.category]
                                        }`}
                                >
                                    {notice.category}
                                </span>
                                <span className="text-xs text-gray-500">{notice.date}</span>
                            </div>
                        </div>
                        <h3 className="text-base font-semibold text-gray-900 mb-1 hover:text-primary-blue transition-colors cursor-pointer">
                            {notice.title}
                        </h3>
                        <p className="text-gray-600 text-sm line-clamp-2">{notice.summary}</p>
                    </div>
                ))}
            </div>

            {/* View All Button */}
            <div className="text-center">
                <a
                    href="/notices/announcements"
                    className="inline-flex items-center px-6 py-2 bg-white text-primary-blue border-2 border-primary-blue rounded-lg font-semibold hover:bg-primary-blue hover:text-white transition-all duration-300 text-sm"
                >
                    전체 공지 보기
                    <svg
                        className="w-4 h-4 ml-2"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                </a>
            </div>
        </div>
    )
}
