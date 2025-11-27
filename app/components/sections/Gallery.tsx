'use client'

import Image from 'next/image'
import { useState } from 'react'

interface GalleryImage {
    id: number
    title: string
    category: string
    imageSrc: string
    date: string
}

// Dummy data - will be replaced with actual images
const dummyGallery: GalleryImage[] = [
    {
        id: 1,
        title: '제 110회 총회 부총회장 추대',
        category: '총회',
        imageSrc: '/images/gallery/placeholder-1.jpg',
        date: '2024-03',
    },
    {
        id: 2,
        title: '제 40-1차 임시회',
        category: '임시노회',
        imageSrc: '/images/gallery/placeholder-2.jpg',
        date: '2024-02',
    },
    {
        id: 3,
        title: '제 40회 정기노회',
        category: '정기노회',
        imageSrc: '/images/gallery/placeholder-3.jpg',
        date: '2024-01',
    },
    {
        id: 4,
        title: '제 39회 정기노회',
        category: '정기노회',
        imageSrc: '/images/gallery/placeholder-4.jpg',
        date: '2023-12',
    },
    {
        id: 5,
        title: '노회 연합 예배',
        category: '예배',
        imageSrc: '/images/gallery/placeholder-5.jpg',
        date: '2023-11',
    },
    {
        id: 6,
        title: '시찰 연합 집회',
        category: '집회',
        imageSrc: '/images/gallery/placeholder-6.jpg',
        date: '2023-10',
    },
]

export default function Gallery() {
    const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null)

    return (
        <>
            <section className="section-padding bg-gray-50">
                <div className="container-custom">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            PHOTO GALLERY
                        </h2>
                        <p className="text-gray-600 text-lg">
                            남경기노회의 주요 활동과 행사를 사진으로 만나보세요
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {dummyGallery.map((image) => (
                            <div
                                key={image.id}
                                className="group relative aspect-[4/3] bg-gray-200 rounded-xl overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300"
                                onClick={() => setSelectedImage(image)}
                            >
                                {/* Placeholder div with gradient - will be replaced with actual images */}
                                <div className="absolute inset-0 bg-gradient-to-br from-brand-300 to-accent-300 opacity-80 group-hover:opacity-60 transition-opacity" />

                                <div className="absolute inset-0 flex items-center justify-center">
                                    <svg
                                        className="w-16 h-16 text-white opacity-50"
                                        fill="none"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>

                                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent text-white">
                                    <p className="text-sm font-medium mb-1">{image.category}</p>
                                    <h3 className="font-semibold text-base">{image.title}</h3>
                                    <p className="text-xs text-gray-300 mt-1">{image.date}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* View All Button */}
                    <div className="text-center mt-10">
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a
                                href="/resources/photos"
                                className="inline-flex items-center px-8 py-3 bg-white text-primary-blue border-2 border-primary-blue rounded-lg font-semibold hover:bg-primary-blue hover:text-white transition-all duration-300"
                            >
                                전체 사진 보기
                                <svg
                                    className="w-5 h-5 ml-2"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </a>
                            <a
                                href="/resources/videos"
                                className="inline-flex items-center px-8 py-3 bg-accent-500 text-white rounded-lg font-semibold hover:bg-accent-600 transition-all duration-300"
                            >
                                영상 자료실
                                <svg
                                    className="w-5 h-5 ml-2"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                    <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Lightbox Modal (simple version) */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
                    onClick={() => setSelectedImage(null)}
                >
                    <div className="relative max-w-4xl w-full">
                        <button
                            onClick={() => setSelectedImage(null)}
                            className="absolute -top-12 right-0 text-white hover:text-gray-300"
                        >
                            <svg
                                className="w-8 h-8"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <div className="bg-white rounded-lg overflow-hidden">
                            <div className="aspect-video bg-gradient-to-br from-brand-300 to-accent-300 flex items-center justify-center">
                                <p className="text-white text-xl font-semibold">
                                    {selectedImage.title}
                                </p>
                            </div>
                            <div className="p-6">
                                <h3 className="text-xl font-bold mb-2">
                                    {selectedImage.title}
                                </h3>
                                <p className="text-gray-600">
                                    {selectedImage.category} | {selectedImage.date}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
