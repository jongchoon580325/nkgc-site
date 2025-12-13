
export const getFileIcon = (mimeType: string) => {
    if (!mimeType) return '📎';
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.startsWith('video/')) return '🎥';
    if (mimeType.startsWith('audio/')) return '🎵';
    if (mimeType === 'application/pdf') return '📄';
    if (mimeType.includes('zip') || mimeType.includes('compressed')) return '📦';
    return '📎';
};

export const isImage = (mimeType: string) => mimeType && mimeType.startsWith('image/');

export function buildFolderTree(folders: any[], parentId: string | null = null, depth = 0): any[] {
    return folders
        .filter(f => f.parentId === parentId)
        .reduce((acc, f) => {
            const children = buildFolderTree(folders, f.id, depth + 1);
            return [...acc, { ...f, depth }, ...children];
        }, []);
}
