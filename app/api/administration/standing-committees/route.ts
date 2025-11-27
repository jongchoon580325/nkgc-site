import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: 상비부 목록 조회
export async function GET(request: NextRequest) {
    try {
        const committees = await prisma.standingCommittee.findMany({
            orderBy: {
                displayOrder: 'asc'
            }
        });

        return NextResponse.json({
            success: true,
            data: committees
        });
    } catch (error) {
        console.error('상비부 목록 조회 오류:', error);
        return NextResponse.json(
            { success: false, error: '데이터를 불러올 수 없습니다.' },
            { status: 500 }
        );
    }
}
