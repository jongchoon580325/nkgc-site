import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET: 상회비 목록 조회 (공개)
export async function GET(request: NextRequest) {
    try {
        const fees = await prisma.feeStatus.findMany({
            orderBy: [
                { inspection: 'asc' },
                { churchName: 'asc' }
            ]
        });

        // 회기 정보도 함께 반환
        const settings = await prisma.settings.findUnique({
            where: { key: 'current_term' }
        });

        return NextResponse.json({
            success: true,
            data: fees,
            currentTerm: settings?.value || ''
        });
    } catch (error) {
        console.error('상회비 목록 조회 오류:', error);
        return NextResponse.json(
            { success: false, error: '데이터를 불러올 수 없습니다.' },
            { status: 500 }
        );
    }
}
