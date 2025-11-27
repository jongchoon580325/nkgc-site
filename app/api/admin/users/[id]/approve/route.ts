import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST: 회원 승인
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const userId = parseInt(params.id);
        const body = await request.json();
        const { position } = body;

        // 직분에 따라 권한 자동 설정
        const roleMapping: Record<string, string> = {
            pastor: 'pastor',
            elder: 'elder',
            evangelist: 'evangelist',
            member: 'member'
        };

        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                isApproved: true,
                role: roleMapping[position] || 'member',
                approvedAt: new Date()
            },
            select: {
                id: true,
                username: true,
                name: true,
                phone: true,
                email: true,
                role: true,
                isApproved: true
            }
        });

        // TODO: 승인 알림 발송 (SMS 또는 이메일)
        // await sendApprovalNotification(user);

        return NextResponse.json({
            success: true,
            data: user,
            message: '회원이 승인되었습니다.'
        });
    } catch (error) {
        console.error('회원 승인 오류:', error);
        return NextResponse.json(
            { success: false, error: '회원 승인에 실패했습니다.' },
            { status: 500 }
        );
    }
}
