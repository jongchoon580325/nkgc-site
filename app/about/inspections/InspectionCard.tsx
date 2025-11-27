'use client'

import { useState } from 'react'

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

export interface InspectionData {
    id: string
    name: string
    leader: PersonInfo
    secretary: PersonInfo
    description: string
    churches: ChurchInfo[]
}

interface InspectionCardProps {
    inspection: InspectionData
    index: number
    isExpanded: boolean
    onToggle: () => void
}

export default function InspectionCard({
    inspection,
    index,
    isExpanded,
    onToggle,
}: InspectionCardProps) {

    return (
        <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100">
            {/* Card Header with Gradient */}
            <div className="bg-gradient-to-r from-brand-500 to-accent-500 p-6 text-white">
                <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold">{inspection.name}</h3>
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-2xl font-bold">
                        {index + 1}
                    </div>
                </div>
                <p className="mt-2 text-white/90">{inspection.description}</p>
            </div>

            {/* Card Body */}
            <div className="p-6">
                {/* Leadership Info */}
                <div className="mb-6 space-y-3">
                    <div className="flex items-center p-3 bg-brand-50 rounded-lg">
                        <svg
                            className="w-5 h-5 text-brand-600 mr-3"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <div>
                            <span className="text-sm text-gray-600 mr-2">
                                시찰장:
                            </span>
                            <span className="font-semibold text-gray-900">
                                {inspection.leader.name}{' '}
                                {inspection.leader.title}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center p-3 bg-accent-50 rounded-lg">
                        <svg
                            className="w-5 h-5 text-accent-600 mr-3"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <div>
                            <span className="text-sm text-gray-600 mr-2">
                                서기:
                            </span>
                            <span className="font-semibold text-gray-900">
                                {inspection.secretary.name}{' '}
                                {inspection.secretary.title}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Expand/Collapse Button */}
                {inspection.churches.length > 0 && (
                    <button
                        onClick={onToggle}
                        className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-brand-50 to-accent-50 rounded-lg hover:from-brand-100 hover:to-accent-100 transition-all duration-200 border border-brand-200"
                    >
                        <div className="flex items-center">
                            <svg
                                className="w-5 h-5 text-primary-blue mr-2"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            <span className="font-semibold text-gray-900">
                                소속 교회 ({inspection.churches.length}개)
                            </span>
                        </div>
                        <svg
                            className={`w-6 h-6 text-primary-blue transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''
                                }`}
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                )}

                {/* Churches List - Collapsible */}
                {inspection.churches.length > 0 && (
                    <div
                        className={`overflow-hidden transition-all duration-500 ease-in-out ${isExpanded
                            ? 'max-h-[2000px] opacity-100 mt-4'
                            : 'max-h-0 opacity-0'
                            }`}
                    >
                        <div className="space-y-3">
                            {inspection.churches.map((church, idx) => (
                                <div
                                    key={idx}
                                    className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200 animate-fadeIn"
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <h5 className="font-semibold text-gray-900 text-lg">
                                            {church.name}
                                        </h5>
                                        <span className="text-sm text-gray-600 bg-white px-3 py-1 rounded-full">
                                            {church.pastor} 목사
                                        </span>
                                    </div>
                                    <div className="space-y-1 text-sm text-gray-600">
                                        <div className="flex items-center">
                                            <svg
                                                className="w-4 h-4 mr-2 text-gray-400"
                                                fill="none"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            {church.address}
                                        </div>
                                        {church.phone && (
                                            <div className="flex items-center">
                                                <svg
                                                    className="w-4 h-4 mr-2 text-gray-400"
                                                    fill="none"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                </svg>
                                                {church.phone}
                                            </div>
                                        )}
                                        {church.mobile && (
                                            <div className="flex items-center">
                                                <svg
                                                    className="w-4 h-4 mr-2 text-gray-400"
                                                    fill="none"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                </svg>
                                                {church.mobile}
                                            </div>
                                        )}
                                        {church.email && (
                                            <div className="flex items-center">
                                                <svg
                                                    className="w-4 h-4 mr-2 text-gray-400"
                                                    fill="none"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                                {church.email}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* No Churches Message */}
                {inspection.churches.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        <svg
                            className="w-12 h-12 mx-auto mb-2 text-gray-300"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        소속 교회 정보가 없습니다.
                    </div>
                )}
            </div>
        </div>
    )
}
