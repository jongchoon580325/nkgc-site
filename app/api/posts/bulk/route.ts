
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export const dynamic = 'force-dynamic';

// DELETE: Bulk Delete
export async function DELETE(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        // Only Admin
        if (!session || (session.user.role !== 'admin' && session.user.role !== 'ADMIN')) {
            return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
        }

        const body = await request.json();
        const { ids } = body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({ error: '삭제할 게시글을 선택해주세요.' }, { status: 400 });
        }

        const result = await prisma.post.deleteMany({
            where: {
                id: { in: ids }
            }
        });

        return NextResponse.json({ success: true, count: result.count });
    } catch (error) {
        console.error('Bulk delete error:', error);
        return NextResponse.json({ error: '일괄 삭제 중 오류가 발생했습니다.' }, { status: 500 });
    }
}

// PATCH: Bulk Move
export async function PATCH(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        // Only Admin
        if (!session || (session.user.role !== 'admin' && session.user.role !== 'ADMIN')) {
            return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
        }

        const body = await request.json();
        const { ids, targetBoardType } = body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({ error: '이동할 게시글을 선택해주세요.' }, { status: 400 });
        }

        if (!targetBoardType) {
            return NextResponse.json({ error: '대상 게시판을 선택해주세요.' }, { status: 400 });
        }

        const result = await prisma.post.updateMany({
            where: {
                id: { in: ids }
            },
            data: {
                boardType: targetBoardType
            }
        });

        return NextResponse.json({ success: true, count: result.count });
    } catch (error) {
        console.error('Bulk move error:', error);
        return NextResponse.json({ error: '일괄 이동 중 오류가 발생했습니다.' }, { status: 500 });
    }
}
