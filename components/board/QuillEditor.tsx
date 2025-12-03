'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';
import TurndownService from 'turndown';
import { marked } from 'marked';

// Dynamic import for ReactQuill
const ReactQuill = dynamic(async () => {
    const { default: RQ } = await import('react-quill-new');
    const { default: Quill } = await import('quill');

    // Register Table Module
    try {
        const QuillBetterTable = (await import('quill-better-table')).default;
        Quill.register('modules/better-table', QuillBetterTable);
    } catch (e) {
        console.warn('Failed to load better-table module', e);
    }

    // Register Markdown Shortcuts
    try {
        const MarkdownShortcuts = (await import('quill-markdown-shortcuts')).default;
        Quill.register('modules/markdownShortcuts', MarkdownShortcuts);
    } catch (e) {
        console.warn('Failed to load markdown shortcuts', e);
    }

    return RQ as any;
}, { ssr: false });

interface QuillEditorProps {
    value: string;
    onChange: (content: string) => void;
    placeholder?: string;
    readOnly?: boolean;
    className?: string;
}

type ViewMode = 'rich' | 'html' | 'markdown';

export default function QuillEditor({ value, onChange, placeholder, readOnly, className }: QuillEditorProps) {
    const [viewMode, setViewMode] = useState<ViewMode>('rich');
    const [localValue, setLocalValue] = useState(value);
    const quillRef = useRef<any>(null);

    // Sync local value when prop changes (only if not editing in other modes to avoid conflict)
    useEffect(() => {
        if (viewMode === 'rich' && value !== localValue) {
            setLocalValue(value);
        }
    }, [value, viewMode]);

    const modules = useMemo(() => ({
        toolbar: {
            container: [
                [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                [{ 'color': [] }, { 'background': [] }],
                ['link', 'image', 'video'],
                ['clean'],
            ],
        },
        'better-table': {},
        clipboard: {
            matchVisual: false
        },
        markdownShortcuts: {}
    }), []);

    const handleRichChange = (content: string) => {
        setLocalValue(content);
        onChange(content);
    };

    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setLocalValue(e.target.value);
    };

    // YouTube 버튼 핸들러
    const handleYouTubeInsert = () => {
        const url = prompt('YouTube URL을 입력하세요:');
        if (!url) return;

        // YouTube URL에서 video ID 추출
        let videoId = '';
        try {
            const urlObj = new URL(url);
            if (urlObj.hostname.includes('youtube.com')) {
                videoId = urlObj.searchParams.get('v') || '';
            } else if (urlObj.hostname.includes('youtu.be')) {
                videoId = urlObj.pathname.slice(1);
            }
        } catch (e) {
            alert('올바른 YouTube URL을 입력해주세요.');
            return;
        }

        if (!videoId) {
            alert('YouTube 비디오 ID를 찾을 수 없습니다.');
            return;
        }

        // Quill 에디터에 YouTube iframe 삽입
        if (quillRef.current) {
            const quill = quillRef.current.getEditor();
            const range = quill.getSelection();
            const embedUrl = `https://www.youtube.com/embed/${videoId}`;
            quill.insertEmbed(range ? range.index : 0, 'video', embedUrl);
        }
    };

    const toggleViewMode = (mode: ViewMode) => {
        if (viewMode === mode) return;

        let nextContent = localValue;

        // Conversion logic when SWITCHING FROM current mode
        if (viewMode === 'rich') {
            // Rich -> HTML: Already in HTML format (localValue)
            // Rich -> Markdown: Convert HTML to Markdown
            if (mode === 'markdown') {
                const turndownService = new TurndownService();
                nextContent = turndownService.turndown(localValue);
            }
        } else if (viewMode === 'html') {
            // HTML -> Rich: Just use the HTML
            // HTML -> Markdown: Convert HTML to Markdown
            if (mode === 'markdown') {
                const turndownService = new TurndownService();
                nextContent = turndownService.turndown(localValue);
            } else if (mode === 'rich') {
                // Update parent on switch back
                onChange(localValue);
            }
        } else if (viewMode === 'markdown') {
            // Markdown -> Rich: Convert Markdown to HTML
            // Markdown -> HTML: Convert Markdown to HTML
            const htmlContent = marked.parse(localValue) as string;
            nextContent = htmlContent;

            if (mode === 'rich') {
                onChange(htmlContent);
            }
        }

        setLocalValue(nextContent);
        setViewMode(mode);
    };

    // Custom Toolbar for Mode Switching
    const CustomToolbar = () => (
        <div className="flex gap-2 mb-2 justify-between items-center">
            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={() => toggleViewMode('rich')}
                    className={`px-3 py-1 rounded text-sm ${viewMode === 'rich' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                    에디터
                </button>
                <button
                    type="button"
                    onClick={() => toggleViewMode('html')}
                    className={`px-3 py-1 rounded text-sm ${viewMode === 'html' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                    HTML
                </button>
                <button
                    type="button"
                    onClick={() => toggleViewMode('markdown')}
                    className={`px-3 py-1 rounded text-sm ${viewMode === 'markdown' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                    Markdown
                </button>
            </div>

            {viewMode === 'rich' && (
                <button
                    type="button"
                    onClick={handleYouTubeInsert}
                    className="px-4 py-1 rounded text-sm bg-red-600 text-white hover:bg-red-700 flex items-center gap-1"
                    title="YouTube 영상 삽입"
                >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                    YouTube
                </button>
            )}
        </div>
    );

    return (
        <div className={`quill-editor-wrapper ${className}`}>
            <CustomToolbar />

            {viewMode === 'rich' && (
                <div className="bg-white">
                    <ReactQuill
                        ref={quillRef}
                        theme="snow"
                        value={localValue}
                        onChange={handleRichChange}
                        modules={modules}
                        formats={[
                            'header',
                            'bold', 'italic', 'underline', 'strike',
                            'list',
                            'color', 'background',
                            'link', 'image', 'video',
                            'table', 'code-block', 'blockquote'
                        ]}
                        placeholder={placeholder}
                        readOnly={readOnly}
                    />
                </div>
            )}

            {viewMode === 'html' && (
                <textarea
                    value={localValue}
                    onChange={handleTextareaChange}
                    className="w-full h-96 p-4 font-mono text-sm border border-gray-300 rounded bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="HTML 코드를 입력하세요..."
                />
            )}

            {viewMode === 'markdown' && (
                <textarea
                    value={localValue}
                    onChange={handleTextareaChange}
                    className="w-full h-96 p-4 font-mono text-sm border border-gray-300 rounded bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Markdown을 입력하세요..."
                />
            )}

            <style jsx global>{`
                .quill-editor-wrapper .ql-container {
                    font-size: 16px;
                    min-height: 300px;
                }
                .quill-editor-wrapper .ql-editor {
                    min-height: 300px;
                }
                /* Video responsive fix */
                .ql-video {
                    width: 100%;
                    aspect-ratio: 16 / 9;
                }
            `}</style>
        </div>
    );
}
