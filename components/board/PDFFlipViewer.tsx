'use client';

import './polyfill'; // Must be imported before react-pdf
import { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import HTMLFlipBook from 'react-pageflip';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Worker 설정
// pdfjs.version이 올바르게 로드되지 않을 경우를 대비해 하드코딩된 버전 사용 가능성 열어둠
const PDFJS_VERSION = pdfjs.version || '4.4.168';

interface PDFFlipViewerProps {
    fileUrl: string;
    onClose: () => void;
}

export default function PDFFlipViewer({ fileUrl, onClose }: PDFFlipViewerProps) {
    const [numPages, setNumPages] = useState<number>(0);
    const [width, setWidth] = useState(400); // Default width
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // 클라이언트 사이드에서만 워커 설정
        if (typeof window !== 'undefined') {
            try {
                // unpkg CDN 사용
                pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${PDFJS_VERSION}/build/pdf.worker.min.mjs`;
            } catch (e) {
                console.error('PDF Worker setup failed:', e);
            }
        }
    }, []);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
    }

    // 반응형 크기 조절
    useEffect(() => {
        const updateSize = () => {
            if (containerRef.current) {
                // 화면 크기에 따라 적절한 너비 계산 (모바일 고려)
                const containerWidth = containerRef.current.clientWidth;
                const isMobile = window.innerWidth < 768;

                // 비율 유지하면서 전체가 보이도록 높이 기준 계산 추가
                const maxWidth = isMobile ? containerWidth * 0.9 : containerWidth * 0.45;
                // 헤더(약 60px) + 하단 문구(약 40px) + 여백 고려하여 높이 제한
                const maxHeight = window.innerHeight - 140;

                // A4 비율 (1 : 1.414) 기준
                const calculatedWidth = Math.min(maxWidth, maxHeight / 1.414);

                setWidth(calculatedWidth);
            }
        };

        window.addEventListener('resize', updateSize);
        updateSize(); // 초기 실행

        return () => window.removeEventListener('resize', updateSize);
    }, []);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col items-center justify-center p-4">
            {/* Header / Close Button */}
            <div className="w-full max-w-6xl flex justify-between items-center mb-4 text-white">
                <h2 className="text-lg font-bold">자료 뷰어</h2>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Viewer Container */}
            <div ref={containerRef} className="flex-1 w-full max-w-6xl flex items-center justify-center overflow-hidden">
                <Document
                    file={fileUrl}
                    onLoadSuccess={onDocumentLoadSuccess}
                    loading={<div className="text-white">문서를 불러오는 중...</div>}
                    error={<div className="text-red-400">문서를 불러오는데 실패했습니다.</div>}
                >
                    {numPages > 0 && (
                        // @ts-ignore - react-pageflip types might be missing or incompatible
                        <HTMLFlipBook
                            width={width}
                            height={width * 1.414} // A4 비율 근사치
                            size="stretch"
                            minWidth={200}
                            maxWidth={1000}
                            minHeight={300}
                            maxHeight={1533}
                            maxShadowOpacity={0.5}
                            showCover={true}
                            mobileScrollSupport={true}
                            className="demo-book"
                        >
                            {Array.from(new Array(numPages), (el, index) => (
                                <div key={`page_${index + 1}`} className="bg-white shadow-lg">
                                    <Page
                                        pageNumber={index + 1}
                                        width={width}
                                        renderAnnotationLayer={false}
                                        renderTextLayer={false}
                                    />
                                    <div className="absolute bottom-2 w-full text-center text-xs text-gray-400">
                                        - {index + 1} -
                                    </div>
                                </div>
                            ))}
                        </HTMLFlipBook>
                    )}
                </Document>
            </div>

            <div className="mt-4 text-white text-sm opacity-70 text-center w-full">
                좌우로 드래그하거나 클릭하여 페이지를 넘길 수 있습니다.
            </div>
        </div>
    );
}
