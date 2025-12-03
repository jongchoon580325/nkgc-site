'use client';

import { useState, useEffect, useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import TurndownService from 'turndown';
import { marked } from 'marked';

interface TinyMCEEditorProps {
    value: string;
    onChange: (content: string) => void;
    placeholder?: string;
    readOnly?: boolean;
    className?: string;
}

type ViewMode = 'rich' | 'html' | 'markdown';

export default function TinyMCEEditor({ value, onChange, placeholder, readOnly, className }: TinyMCEEditorProps) {
    const [viewMode, setViewMode] = useState<ViewMode>('rich');
    const [localValue, setLocalValue] = useState(value);
    const editorRef = useRef<any>(null);

    // Sync local value when prop changes
    useEffect(() => {
        if (viewMode === 'rich' && value !== localValue) {
            setLocalValue(value);
        }
    }, [value, viewMode]);

    const handleEditorChange = (content: string) => {
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

        if (editorRef.current) {
            const iframe = `<iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>`;
            editorRef.current.insertContent(iframe);
        }
    };

    const toggleViewMode = (mode: ViewMode) => {
        if (viewMode === mode) return;

        let nextContent = localValue;

        // Conversion logic
        if (viewMode === 'rich') {
            if (mode === 'markdown') {
                const turndownService = new TurndownService();
                nextContent = turndownService.turndown(localValue);
            }
            // HTML mode: no conversion needed
        } else if (viewMode === 'html') {
            if (mode === 'markdown') {
                const turndownService = new TurndownService();
                nextContent = turndownService.turndown(localValue);
            } else if (mode === 'rich') {
                onChange(localValue);
            }
        } else if (viewMode === 'markdown') {
            const htmlContent = marked.parse(localValue) as string;
            nextContent = htmlContent;
            if (mode === 'rich') {
                onChange(htmlContent);
            }
        }

        setLocalValue(nextContent);
        setViewMode(mode);
    };

    // Custom Toolbar
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
        <div className={`tinymce-editor-wrapper ${className}`}>
            <CustomToolbar />

            {viewMode === 'rich' && (
                <Editor
                    onInit={(evt, editor) => editorRef.current = editor}
                    value={localValue}
                    onEditorChange={handleEditorChange}
                    init={{
                        height: 500,
                        menubar: false,
                        plugins: [
                            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                            'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                        ],
                        toolbar: 'undo redo | blocks | ' +
                            'bold italic forecolor | alignleft aligncenter ' +
                            'alignright alignjustify | bullist numlist outdent indent | ' +
                            'table | removeformat | help',
                        content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
                        placeholder: placeholder,
                        // 테이블 설정
                        table_toolbar: 'tableprops tabledelete | tableinsertrowbefore tableinsertrowafter tabledeleterow | tableinsertcolbefore tableinsertcolafter tabledeletecol',
                        table_appearance_options: true,
                        table_grid: true,
                        table_resize_bars: true,
                        // HTML 유지 설정
                        valid_elements: '*[*]',
                        extended_valid_elements: '*[*]',
                        valid_children: '+body[style]',
                        verify_html: false,
                        cleanup: false,
                        convert_urls: false,
                    }}
                />
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
        </div>
    );
}
