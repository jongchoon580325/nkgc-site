'use client';

import { useEffect, useState } from 'react';
import MediaManager from '@/components/media/MediaManager';
import { createPortal } from 'react-dom';

interface MediaPickerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (assets: any[]) => void;
    selectionMode?: 'single' | 'multiple';
    title?: string;
}

export default function MediaPickerModal({
    isOpen,
    onClose,
    onSelect,
    selectionMode = 'multiple',
    title = '미디어 라이브러리 선택'
}: MediaPickerModalProps) {
    const [mounted, setMounted] = useState(false);
    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            // Slight delay to allow render before animation
            setTimeout(() => setAnimate(true), 10);
        } else {
            setAnimate(false);
            const timer = setTimeout(() => {
                document.body.style.overflow = 'unset';
            }, 300); // Wait for transition
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!mounted) return null;
    if (!isOpen && !animate) return null; // Don't render if closed and animation finished

    const handleSelect = (assets: any[]) => {
        onSelect(assets);
        onClose();
    };

    const modalContent = (
        <div className={`fixed inset-0 z-[60] flex items-center justify-center transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal Container */}
            <div className={`bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[85vh] flex flex-col relative z-20 overflow-hidden transition-all duration-300 transform ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>
                {/* Header */}
                <div className="px-6 py-4 border-b flex items-center justify-between bg-white">
                    <h2 className="text-xl font-bold text-gray-800">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-700"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content - MediaManager with selection mode */}
                <div className="flex-1 overflow-hidden bg-gray-50">
                    <MediaManager
                        onSelect={handleSelect}
                        selectionMode={selectionMode}
                    />
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
}
