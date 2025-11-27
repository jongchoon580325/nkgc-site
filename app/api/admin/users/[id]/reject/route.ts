import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST: 회원 거부
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const userId = parseInt(params.id);
        const body = await request.json();
        const { reason } = body;

        await prisma.user.update({
            where: { id: userId },
            data: {
                rejectedReason: reason,
                isApproved: false
            }
        });

        // TODO: 거부 알림 발송
        // await sendRejectionNotification(user, reason);

        return NextResponse.json({
            success: true,
            message: '회원 신청이 거부되었습니다.'
        });
    } catch (error) {
        console.error('회원 거부 오류:', error);
        return NextResponse.json(
            { success: false, error: '처리 중 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}
