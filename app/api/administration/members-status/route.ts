import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: 노회원 현황 조회 (목사회원, 장로총대)
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const type = searchParams.get('type'); // 'pastor' or 'elder'

        // 기본 필터: 승인된 회원만
        const where: any = {
            isApproved: true
        };

        // 타입별 필터링
        if (type === 'pastor') {
            where.role = 'pastor';
        } else if (type === 'elder') {
            where.role = 'elder';
        } else {
            // 타입이 지정되지 않은 경우 목사와 장로 모두 반환
            where.role = {
                in: ['pastor', 'elder']
            };
        }

        const members = await prisma.user.findMany({
            where,
            select: {
                id: true,
                name: true,
                churchName: true,
                position: true,
                phone: true,
                role: true
            },
            orderBy: {
                name: 'asc' // 이름순 정렬
            }
        });

        return NextResponse.json({
            success: true,
            data: members,
            count: members.length
        });
    } catch (error) {
        console.error('노회원 현황 조회 오류:', error);
        return NextResponse.json(
            { success: false, error: '노회원 현황을 불러올 수 없습니다.' },
            { status: 500 }
        );
    }
}
