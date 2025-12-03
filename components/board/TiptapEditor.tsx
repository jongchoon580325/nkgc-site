'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Youtube from '@tiptap/extension-youtube';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import { useState, useEffect } from 'react';
import TurndownService from 'turndown';
import { marked } from 'marked';

interface TiptapEditorProps {
    value: string;
    onChange: (content: string) => void;
    placeholder?: string;
    readOnly?: boolean;
    className?: string;
}

type ViewMode = 'rich' | 'html' | 'markdown';

export default function TiptapEditor({ value, onChange, placeholder, readOnly, className }: TiptapEditorProps) {
    const [viewMode, setViewMode] = useState<ViewMode>('rich');
    const [localValue, setLocalValue] = useState(value);

    const editor = useEditor({
        extensions: [
            StarterKit,
            Table.configure({
                resizable: true,
                HTMLAttributes: {
                    class: 'tiptap-table',
                },
            }),
            TableRow,
            TableHeader,
            TableCell,
            Link.configure({
                openOnClick: false,
            }),
            Image,
            Youtube.configure({
                width: 640,
                height: 360,
            }),
            TextStyle,
            Color,
        ],
        content: value,
        editable: !readOnly,
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            onChange(html);
            setLocalValue(html);
        },
        immediatelyRender: false,
    });

    // Sync editor content when value prop changes
    useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            editor.commands.setContent(value);
        }
    }, [value, editor]);

    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setLocalValue(e.target.value);
    };

    const handleYouTubeInsert = () => {
        const url = prompt('YouTube URL을 입력하세요:');
        if (!url || !editor) return;

        editor.commands.setYoutubeVideo({ src: url });
    };

    const toggleViewMode = (mode: ViewMode) => {
        if (viewMode === mode) return;

        let nextContent = localValue;

        if (viewMode === 'rich') {
            if (mode === 'markdown') {
                const turndownService = new TurndownService();
                nextContent = turndownService.turndown(localValue);
            }
        } else if (viewMode === 'html') {
            if (mode === 'markdown') {
                const turndownService = new TurndownService();
                nextContent = turndownService.turndown(localValue);
            } else if (mode === 'rich') {
                if (editor) {
                    editor.commands.setContent(localValue);
                }
                onChange(localValue);
            }
        } else if (viewMode === 'markdown') {
            const htmlContent = marked.parse(localValue) as string;
            nextContent = htmlContent;
            if (mode === 'rich') {
                if (editor) {
                    editor.commands.setContent(htmlContent);
                }
                onChange(htmlContent);
            }
        }

        setLocalValue(nextContent);
        setViewMode(mode);
    };

    const MenuBar = () => {
        if (!editor) return null;

        return (
            <div className="border border-gray-300 rounded-t-lg bg-gray-50 p-2 flex flex-wrap gap-1">
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`px-2 py-1 rounded ${editor.isActive('bold') ? 'bg-blue-600 text-white' : 'bg-white'}`}
                >
                    <strong>B</strong>
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={`px-2 py-1 rounded ${editor.isActive('italic') ? 'bg-blue-600 text-white' : 'bg-white'}`}
                >
                    <em>I</em>
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={`px-2 py-1 rounded ${editor.isActive('heading', { level: 2 }) ? 'bg-blue-600 text-white' : 'bg-white'}`}
                >
                    H2
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={`px-2 py-1 rounded ${editor.isActive('bulletList') ? 'bg-blue-600 text-white' : 'bg-white'}`}
                >
                    • 목록
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
                    className="px-2 py-1 rounded bg-white"
                >
                    📊 테이블
                </button>
                <button
                    type="button"
                    onClick={handleYouTubeInsert}
                    className="px-2 py-1 rounded bg-red-600 text-white"
                >
                    YouTube
                </button>
            </div>
        );
    };

    return (
        <div className={`tiptap-editor-wrapper ${className}`}>
            {/* Mode Toggle */}
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
            </div>

            {viewMode === 'rich' && (
                <div>
                    <MenuBar />
                    <EditorContent editor={editor} className="tiptap-content border border-gray-300 rounded-b-lg" />
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
                .tiptap-content .ProseMirror {
                    min-height: 300px;
                    padding: 1rem;
                    outline: none;
                }
                .tiptap-content .ProseMirror:focus {
                    outline: none;
                }
                .tiptap-table {
                    border-collapse: collapse;
                    width: 100%;
                    border: 1px solid #888;
                    margin: 1em 0;
                }
                .tiptap-table th,
                .tiptap-table td {
                    border: 1px solid #888;
                    padding: 8px 12px;
                    text-align: left;
                    min-width: 100px;
                }
                .tiptap-table th {
                    background-color: #f0f0f0;
                    font-weight: 600;
                }
                .tiptap-content img {
                    max-width: 100%;
                    height: auto;
                }
            `}</style>
        </div>
    );
}
