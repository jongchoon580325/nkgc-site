import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: 모든 회원 조회
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const status = searchParams.get('status'); // all, pending, approved
        const search = searchParams.get('search') || '';
        const position = searchParams.get('position');

        const where: any = {};

        // 상태 필터
        if (status === 'pending') {
            where.isApproved = false;
            where.role = 'pending';
        } else if (status === 'approved') {
            where.isApproved = true;
        }

        // 직분 필터
        if (position && position !== 'all') {
            where.position = position;
        }

        // 검색
        if (search) {
            where.OR = [
                { name: { contains: search } },
                { username: { contains: search } },
                { churchName: { contains: search } },
                { phone: { contains: search } }
            ];
        }

        const users = await prisma.user.findMany({
            where,
            orderBy: [
                { isApproved: 'asc' },
                { createdAt: 'desc' }
            ],
            select: {
                id: true,
                username: true,
                name: true,
                phone: true,
                email: true,
                churchName: true,
                position: true,
                role: true,
                isApproved: true,
                createdAt: true,
                lastLoginAt: true
            }
        });

        return NextResponse.json({
            success: true,
            data: users
        });
    } catch (error) {
        console.error('회원 조회 오류:', error);
        return NextResponse.json(
            { success: false, error: '회원 목록을 불러올 수 없습니다.' },
            { status: 500 }
        );
    }
}
