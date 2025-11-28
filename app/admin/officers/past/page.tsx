'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface YearOfficers {
    year: string
    church: string
    officers: {
        노회장: string
        부노회장: string
        서기: string
        부서기: string
        회록서기: string
        부회록서기: string
        회계: string
        부회계: string
    }
}

interface PastOfficersData {
    years: YearOfficers[]
}

export default function AdminPastOfficersPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [deleteIndex, setDeleteIndex] = useState<number | null>(null)
    const [data, setData] = useState<PastOfficersData>({
        years: [],
    })

    const positions = ['노회장', '부노회장', '서기', '부서기', '회록서기', '부회록서기', '회계', '부회계']

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const response = await fetch('/api/past-officers')
            const result = await response.json()
            setData(result)
            setLoading(false)
        } catch (error) {
            alert('데이터 로드 실패')
            setLoading(false)
        }
    }

    const handleYearChange = (index: number, field: 'year' | 'church', value: string) => {
        const newYears = [...data.years]
        newYears[index] = { ...newYears[index], [field]: value }
        setData({ ...data, years: newYears })
    }

    const handleOfficerChange = (
        yearIndex: number,
        position: keyof YearOfficers['officers'],
        value: string
    ) => {
        const newYears = [...data.years]
        newYears[yearIndex].officers[position] = value
        setData({ ...data, years: newYears })
    }

    const addYear = () => {
        const newYear: YearOfficers = {
            year: new Date().getFullYear().toString(),
            church: '',
            officers: {
                노회장: '',
                부노회장: '',
                서기: '',
                부서기: '',
                회록서기: '',
                부회록서기: '',
                회계: '',
                부회계: '',
            },
        }
        setData({ ...data, years: [newYear, ...data.years] })
    }

    const deleteYear = (index: number) => {
        setDeleteIndex(index)
    }

    const confirmDelete = () => {
        if (deleteIndex !== null) {
            const newYears = data.years.filter((_, i) => i !== deleteIndex)
            setData({ ...data, years: newYears })
            setDeleteIndex(null)
        }
    }

    const cancelDelete = () => {
        setDeleteIndex(null)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        try {
            const response = await fetch('/api/past-officers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })

            if (response.ok) {
                alert('✅ 성공적으로 저장되었습니다!')
                router.push('/about/past-officers')
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
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue mx-auto mb-4"></div>
                    <p className="text-gray-600">데이터 로딩 중...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            역대임원 정보 관리
                        </h1>
                        <p className="text-gray-600">
                            역대 노회 임원진의 정보를 수정할 수 있습니다.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={addYear}
                        className="px-6 py-3 bg-accent-600 text-white rounded-lg font-semibold hover:bg-accent-700 transition-colors shadow-md"
                    >
                        ➕ 연도 추가
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Years List */}
                    <div className="space-y-6">
                        {data.years.map((yearData, yearIndex) => (
                            <div
                                key={yearIndex}
                                className="border-2 border-gray-200 rounded-lg p-6 bg-gray-50 relative"
                            >
                                {/* Delete Button */}
                                <button
                                    type="button"
                                    onClick={() => deleteYear(yearIndex)}
                                    className="absolute top-4 right-4 text-red-600 hover:text-red-800 font-bold"
                                    title="삭제"
                                >
                                    ✕
                                </button>

                                {/* Year and Church */}
                                <div className="grid md:grid-cols-2 gap-4 mb-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            연도 *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={yearData.year}
                                            onChange={(e) =>
                                                handleYearChange(yearIndex, 'year', e.target.value)
                                            }
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                                            placeholder="2024"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            교회
                                        </label>
                                        <input
                                            type="text"
                                            value={yearData.church}
                                            onChange={(e) =>
                                                handleYearChange(yearIndex, 'church', e.target.value)
                                            }
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                                            placeholder="교회명"
                                        />
                                    </div>
                                </div>

                                {/* Officers Grid */}
                                <div className="grid md:grid-cols-4 gap-4">
                                    {positions.map((position) => (
                                        <div key={position}>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                                {position}
                                            </label>
                                            <input
                                                type="text"
                                                value={yearData.officers[position as keyof YearOfficers['officers']]}
                                                onChange={(e) =>
                                                    handleOfficerChange(
                                                        yearIndex,
                                                        position as keyof YearOfficers['officers'],
                                                        e.target.value
                                                    )
                                                }
                                                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-primary-blue text-sm"
                                                placeholder="이름"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {data.years.length === 0 && (
                            <div className="text-center py-12 text-gray-500">
                                역대 임원 데이터가 없습니다. "연도 추가" 버튼을 클릭하여
                                추가하세요.
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4 pt-6 border-t">
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 px-6 py-3 bg-primary-blue text-white rounded-lg font-semibold hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving ? '저장 중...' : '✅ 저장하기'}
                        </button>
                        <a
                            href="/about/past-officers"
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
                    <li>• "연도 추가" 버튼으로 새로운 연도를 추가할 수 있습니다.</li>
                    <li>• 각 연도별로 교회명과 8개 직책의 임원 이름을 입력하세요.</li>
                    <li>• 연도별 카드 우측 상단의 ✕ 버튼으로 삭제할 수 있습니다.</li>
                    <li>• 최신 연도가 위에 표시됩니다.</li>
                    <li>• 저장 후 자동으로 역대임원 페이지로 이동합니다.</li>
                </ul>
            </div>

            {/* Back Button */}
            <div className="mt-8 text-center">
                <a
                    href="/about/past-officers"
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
                    역대임원 페이지 바로가기
                </a>
            </div>

            {/* Delete Confirmation Modal */}
            {
                deleteIndex !== null && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-xl">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">삭제 확인</h3>
                            <p className="text-gray-600 mb-6">
                                {data.years[deleteIndex]?.year}년도 임원 정보를 정말 삭제하시겠습니까?
                            </p>
                            <div className="flex gap-4">
                                <button
                                    onClick={confirmDelete}
                                    className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
                                >
                                    삭제
                                </button>
                                <button
                                    onClick={cancelDelete}
                                    className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                                >
                                    취소
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div>
    )
}
