import { BoardType } from '@/lib/board-config';
import PostDetail from '@/components/board/PostDetail';

export default async function PostDetailPage(props: {
    params: Promise<{ type: string; id: string }>;
}) {
    const params = await props.params;
    const boardType = params.type.toUpperCase() as BoardType;

    return <PostDetail boardType={boardType} postId={params.id} />;
}
