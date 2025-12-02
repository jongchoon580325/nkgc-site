import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 공개 API: 현재 활성화된 히어로 섹션 프리셋 조회
export async function GET() {
    try {
        const activeConfig = await prisma.heroConfig.findFirst({
            where: { isActive: true },
            orderBy: { updatedAt: 'desc' },
        });

        return NextResponse.json(activeConfig);
    } catch (error) {
        console.error('Error fetching active hero config:', error);
        return NextResponse.json(
            { error: 'Failed to fetch hero config' },
            { status: 500 }
        );
    }
}
