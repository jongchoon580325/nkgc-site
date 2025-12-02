import { BoardType, BOARD_CONFIG } from '@/lib/board-config';
import PostList from '@/components/board/PostList';
import GalleryList from '@/components/board/GalleryList';

export default async function BoardPage(props: {
    params: Promise<{ type: string }>;
}) {
    const params = await props.params;
    const boardType = params.type.toUpperCase() as BoardType;
    const config = BOARD_CONFIG[boardType];

    if (config.viewType === 'gallery') {
        return <GalleryList boardType={boardType} />;
    }

    return <PostList boardType={boardType} />;
}
