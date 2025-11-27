'use client'

import { useState } from 'react'
import InspectionCard from './InspectionCard'
import type { InspectionData } from './page'

interface InspectionsClientProps {
    inspections: InspectionData[]
}

export default function InspectionsClient({
    inspections,
}: InspectionsClientProps) {
    const [expandedStates, setExpandedStates] = useState<boolean[]>(
        new Array(inspections.length).fill(false)
    )

    const allExpanded = expandedStates.every((state) => state)

    const toggleAll = () => {
        if (allExpanded) {
            // 모두 접기
            setExpandedStates(new Array(inspections.length).fill(false))
        } else {
            // 모두 펼치기
            setExpandedStates(new Array(inspections.length).fill(true))
        }
    }

    const toggleCard = (index: number) => {
        setExpandedStates((prev) => {
            const newStates = [...prev]
            newStates[index] = !newStates[index]
            return newStates
        })
    }

    return (
        <>
            {/* Expand/Collapse All Button */}
            <div className="flex justify-end mb-6">
                <button
                    onClick={toggleAll}
                    className="inline-flex items-center px-6 py-3 bg-white border-2 border-primary-blue text-primary-blue rounded-lg font-semibold hover:bg-primary-blue hover:text-white transition-all duration-200 shadow-md hover:shadow-lg"
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
                        {allExpanded ? (
                            // 접기 아이콘
                            <path d="M5 15l7-7 7 7" />
                        ) : (
                            // 펼치기 아이콘
                            <path d="M19 9l-7 7-7-7" />
                        )}
                    </svg>
                    {allExpanded ? '모두 접기' : '모두 펼치기'}
                </button>
            </div>

            {/* Inspections Grid */}
            <div className="grid md:grid-cols-2 gap-8">
                {inspections.map((inspection, index) => (
                    <InspectionCard
                        key={inspection.id}
                        inspection={inspection}
                        index={index}
                        isExpanded={expandedStates[index]}
                        onToggle={() => toggleCard(index)}
                    />
                ))}
            </div>
        </>
    )
}
