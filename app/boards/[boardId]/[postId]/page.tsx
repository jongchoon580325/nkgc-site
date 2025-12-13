
import { BoardType } from '@/lib/board-config';
import PostDetail from '@/components/board/PostDetail';

export default async function PostDetailPage(props: {
    params: Promise<{ boardId: string; postId: string }>;
}) {
    const params = await props.params;
    const boardType = params.boardId.toUpperCase() as BoardType;

    return <PostDetail boardType={boardType} postId={params.postId} />;
}
