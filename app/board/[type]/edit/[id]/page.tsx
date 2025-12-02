import { notFound } from 'next/navigation';
import { BoardType, BOARD_CONFIG } from '@/lib/board-config';
import PostEdit from '@/components/board/PostEdit';

interface PageProps {
    params: Promise<{
        type: string;
        id: string;
    }>;
}

export default async function PostEditPage(props: PageProps) {
    const params = await props.params;
    const { type, id } = params;

    // Validate board type
    if (!Object.keys(BOARD_CONFIG).includes(type)) {
        notFound();
    }

    return <PostEdit boardType={type as BoardType} postId={id} />;
}
