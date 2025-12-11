import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: 노회원 현황 조회 (목사회원, 장로총대)
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const type = searchParams.get('type'); // 'pastor' or 'elder'

        // 승인된 회원만 조회
        const allMembers = await prisma.user.findMany({
            where: {
                isApproved: true
            },
            select: {
                id: true,
                name: true,
                churchName: true,
                position: true,
                category: true,
                phone: true,
                role: true
            },
            orderBy: {
                name: 'asc' // 이름순 정렬
            }
        });

        // position 필드 기준으로 필터링
        let filteredMembers = allMembers;

        if (type === 'pastor') {
            // 목사: position에 '목사' 포함 (부목사, 담임목사 등 모두 포함)
            filteredMembers = allMembers.filter(m =>
                m.position && m.position.includes('목사')
            );
        } else if (type === 'elder') {
            // 장로: position이 '장로'인 경우
            filteredMembers = allMembers.filter(m =>
                m.position && m.position === '장로'
            );
        } else {
            // 타입이 지정되지 않은 경우 목사와 장로 모두 반환
            filteredMembers = allMembers.filter(m =>
                m.position && (m.position.includes('목사') || m.position === '장로')
            );
        }

        return NextResponse.json({
            success: true,
            data: filteredMembers,
            count: filteredMembers.length
        });
    } catch (error) {
        console.error('노회원 현황 조회 오류:', error);
        return NextResponse.json(
            { success: false, error: '노회원 현황을 불러올 수 없습니다.' },
            { status: 500 }
        );
    }
}
