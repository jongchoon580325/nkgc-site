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

    // Register Markdown Shortcuts
    // Note: We need to dynamically import this as well if it depends on window/document
    // or just require it. Some packages might need 'quill' to be available globally or passed.
    // For now, let's try standard import if it works, otherwise we might need a workaround.
    try {
        const MarkdownShortcuts = (await import('quill-markdown-shortcuts')).default;
        Quill.register('modules/markdownShortcuts', MarkdownShortcuts);
    } catch (e) {
        console.warn('Failed to load markdown shortcuts', e);
    }

    // Add custom fonts size if needed, but header 1-6 is standard
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
        clipboard: {
            matchVisual: false,
        },
        markdownShortcuts: {} // Enable markdown shortcuts
    }), []);

    const handleRichChange = (content: string) => {
        setLocalValue(content);
        onChange(content);
    };

    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setLocalValue(e.target.value);
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
        <div className="flex gap-2 mb-2 justify-end text-sm">
            <button
                type="button"
                onClick={() => toggleViewMode('rich')}
                className={`px-3 py-1 rounded ${viewMode === 'rich' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
                에디터
            </button>
            <button
                type="button"
                onClick={() => toggleViewMode('html')}
                className={`px-3 py-1 rounded ${viewMode === 'html' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
                HTML
            </button>
            <button
                type="button"
                onClick={() => toggleViewMode('markdown')}
                className={`px-3 py-1 rounded ${viewMode === 'markdown' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
                Markdown
            </button>
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
                            'link', 'image', 'video'
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
