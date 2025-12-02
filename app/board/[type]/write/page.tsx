import { BoardType } from '@/lib/board-config';
import PostWrite from '@/components/board/PostWrite';

export default async function PostWritePage(props: {
    params: Promise<{ type: string }>;
}) {
    const params = await props.params;
    const boardType = params.type.toUpperCase() as BoardType;

    return <PostWrite boardType={boardType} />;
}
