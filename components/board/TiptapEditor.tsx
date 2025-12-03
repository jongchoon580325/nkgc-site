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
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
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
            Underline,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
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

    const handleImageInsert = () => {
        const url = prompt('이미지 URL을 입력하세요:');
        if (!url || !editor) return;

        editor.commands.setImage({ src: url });
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

        const Button = ({ onClick, isActive, children, title }: any) => (
            <button
                type="button"
                onClick={onClick}
                className={`p-1.5 rounded text-sm min-w-[32px] flex items-center justify-center transition-colors ${isActive ? 'bg-blue-100 text-blue-700 font-medium' : 'hover:bg-gray-100 text-gray-700'
                    }`}
                title={title}
            >
                {children}
            </button>
        );

        const Divider = () => <div className="w-px h-6 bg-gray-300 mx-1" />;

        return (
            <div className="border border-gray-300 rounded-t-lg bg-white p-2 flex flex-wrap gap-1 items-center sticky top-0 z-10">
                {/* History */}
                <div className="flex gap-0.5">
                    <Button onClick={() => editor.chain().focus().undo().run()} title="실행 취소">↩</Button>
                    <Button onClick={() => editor.chain().focus().redo().run()} title="다시 실행">↪</Button>
                </div>

                <Divider />

                {/* Headings */}
                <select
                    className="h-8 border border-gray-200 rounded px-2 text-sm bg-transparent hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={(e) => {
                        const val = e.target.value;
                        if (val === 'p') editor.chain().focus().setParagraph().run();
                        else editor.chain().focus().toggleHeading({ level: parseInt(val) as any }).run();
                    }}
                    value={
                        editor.isActive('heading', { level: 1 }) ? '1' :
                            editor.isActive('heading', { level: 2 }) ? '2' :
                                editor.isActive('heading', { level: 3 }) ? '3' :
                                    editor.isActive('heading', { level: 4 }) ? '4' :
                                        editor.isActive('heading', { level: 5 }) ? '5' :
                                            editor.isActive('heading', { level: 6 }) ? '6' : 'p'
                    }
                >
                    <option value="p">본문</option>
                    <option value="1">제목 1 (H1)</option>
                    <option value="2">제목 2 (H2)</option>
                    <option value="3">제목 3 (H3)</option>
                    <option value="4">제목 4 (H4)</option>
                    <option value="5">제목 5 (H5)</option>
                    <option value="6">제목 6 (H6)</option>
                </select>

                <Divider />

                {/* Text Formatting */}
                <div className="flex gap-0.5">
                    <Button onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} title="굵게"><strong>B</strong></Button>
                    <Button onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} title="기울임"><em>I</em></Button>
                    <Button onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} title="밑줄"><u>U</u></Button>
                    <Button onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')} title="취소선"><s>S</s></Button>
                    <Button onClick={() => editor.chain().focus().toggleCode().run()} isActive={editor.isActive('code')} title="코드">{'<>'}</Button>
                </div>

                <Divider />

                {/* Alignment */}
                <div className="flex gap-0.5">
                    <Button onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })} title="왼쪽 정렬">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M3 21h18v-2H3v2zm0-4h12v-2H3v2zm0-4h18v-2H3v2zm0-4h12V7H3v2zm0-6v2h18V3H3z" /></svg>
                    </Button>
                    <Button onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })} title="가운데 정렬">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M7 21h10v-2H7v2zM3 17h18v-2H3v2zm4-4h10v-2H7v2zM3 9h18V7H3v2zm4-4h10V3H7v2z" /></svg>
                    </Button>
                    <Button onClick={() => editor.chain().focus().setTextAlign('right').run()} isActive={editor.isActive({ textAlign: 'right' })} title="오른쪽 정렬">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M3 21h18v-2H3v2zm6-4h12v-2H9v2zm-6-4h18v-2H3v2zm6-4h12V7H9v2zm-6-6v2h18V3H3z" /></svg>
                    </Button>
                    <Button onClick={() => editor.chain().focus().setTextAlign('justify').run()} isActive={editor.isActive({ textAlign: 'justify' })} title="양쪽 정렬">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M3 21h18v-2H3v2zm0-4h18v-2H3v2zm0-4h18v-2H3v2zm0-4h18V7H3v2zm0-6v2h18V3H3z" /></svg>
                    </Button>
                </div>

                <Divider />

                {/* Lists */}
                <div className="flex gap-0.5">
                    <Button onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} title="글머리 기호">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z" /></svg>
                    </Button>
                    <Button onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} title="번호 매기기">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z" /></svg>
                    </Button>
                </div>

                <Divider />

                {/* Insert */}
                <div className="flex gap-0.5">
                    <Button onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} title="인용구">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z" /></svg>
                    </Button>
                    <Button onClick={() => editor.chain().focus().setHorizontalRule().run()} title="구분선">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13H5v-2h14v2z" /></svg>
                    </Button>
                    <Button onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} title="표 삽입">
                        <span className="text-lg">▦</span>
                    </Button>
                    <Button onClick={handleImageInsert} title="이미지 삽입">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" /></svg>
                    </Button>
                    <Button onClick={handleYouTubeInsert} title="YouTube 영상">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="red"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" /></svg>
                    </Button>
                </div>
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
                <div className="border border-gray-300 rounded-lg overflow-hidden shadow-sm">
                    <MenuBar />
                    <EditorContent editor={editor} className="tiptap-content min-h-[400px] bg-white" />
                </div>
            )}

            {viewMode === 'html' && (
                <textarea
                    value={localValue}
                    onChange={handleTextareaChange}
                    className="w-full h-[500px] p-4 font-mono text-sm border border-gray-300 rounded bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="HTML 코드를 입력하세요..."
                />
            )}

            {viewMode === 'markdown' && (
                <textarea
                    value={localValue}
                    onChange={handleTextareaChange}
                    className="w-full h-[500px] p-4 font-mono text-sm border border-gray-300 rounded bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Markdown을 입력하세요..."
                />
            )}

            <style jsx global>{`
                .tiptap-content .ProseMirror {
                    min-height: 400px;
                    padding: 1.5rem;
                    outline: none;
                }
                .tiptap-content .ProseMirror:focus {
                    outline: none;
                }
                .tiptap-content .ProseMirror p {
                    margin-bottom: 0.8em;
                    line-height: 1.6;
                }
                .tiptap-content .ProseMirror h1 { font-size: 2em; font-weight: bold; margin-top: 0.8em; margin-bottom: 0.4em; }
                .tiptap-content .ProseMirror h2 { font-size: 1.5em; font-weight: bold; margin-top: 0.8em; margin-bottom: 0.4em; }
                .tiptap-content .ProseMirror h3 { font-size: 1.25em; font-weight: bold; margin-top: 0.8em; margin-bottom: 0.4em; }
                .tiptap-content .ProseMirror ul { list-style-type: disc; padding-left: 1.5em; margin-bottom: 0.8em; }
                .tiptap-content .ProseMirror ol { list-style-type: decimal; padding-left: 1.5em; margin-bottom: 0.8em; }
                .tiptap-content .ProseMirror blockquote { border-left: 4px solid #ddd; padding-left: 1em; color: #666; margin-left: 0; margin-right: 0; }
                .tiptap-content .ProseMirror hr { border: none; border-top: 1px solid #ddd; margin: 1.5em 0; }
                
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
