import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        // 전체 회원 수
        const totalUsers = await prisma.user.count();

        // 승인 대기 회원 수
        const pendingUsers = await prisma.user.count({
            where: {
                isApproved: false,
                role: 'pending'
            }
        });

        // 승인된 회원 수
        const approvedUsers = await prisma.user.count({
            where: {
                isApproved: true
            }
        });

        // 최근 가입 신청 (최근 5명)
        const recentApplications = await prisma.user.findMany({
            where: {
                isApproved: false,
                role: 'pending'
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 5,
            select: {
                id: true,
                username: true,
                name: true,
                churchName: true,
                position: true,
                createdAt: true
            }
        });

        // 최근 승인된 회원 (최근 5명)
        const recentApproved = await prisma.user.findMany({
            where: {
                isApproved: true
            },
            orderBy: {
                approvedAt: 'desc'
            },
            take: 5,
            select: {
                id: true,
                username: true,
                name: true,
                churchName: true,
                position: true,
                approvedAt: true
            }
        });

        return NextResponse.json({
            success: true,
            data: {
                stats: {
                    totalUsers,
                    pendingUsers,
                    approvedUsers,
                    organizations: 6, // 고정값 (주교연합회, 학생회, 청년회, 남전도회, 여전도회, 시찰)
                },
                recentApplications,
                recentApproved
            }
        });
    } catch (error) {
        console.error('대시보드 통계 조회 오류:', error);
        return NextResponse.json(
            { success: false, error: '통계를 불러올 수 없습니다.' },
            { status: 500 }
        );
    }
}
