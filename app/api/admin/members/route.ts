import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

// GET: 정회원 목록 조회 (관리자용)
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const role = searchParams.get('role'); // 'pastor' or 'elder'

        const where: any = {
            isApproved: true,
            role: {
                in: ['pastor', 'elder']
            }
        };

        // Role filter
        if (role && (role === 'pastor' || role === 'elder')) {
            where.role = role;
        }

        const members = await prisma.user.findMany({
            where,
            select: {
                id: true,
                name: true,
                churchName: true,
                position: true,
                phone: true,
                role: true,
                isApproved: true,
                createdAt: true
            },
            orderBy: {
                name: 'asc'
            }
        });

        return NextResponse.json({
            success: true,
            data: members
        });
    } catch (error) {
        console.error('정회원 목록 조회 오류:', error);
        return NextResponse.json(
            { success: false, error: '데이터를 불러올 수 없습니다.' },
            { status: 500 }
        );
    }
}

// POST: 정회원 추가
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, churchName, position, phone, role } = body;

        // 필수 항목 검증 (phone은 선택사항)
        if (!name || !churchName || !position || !role) {
            return NextResponse.json(
                { success: false, error: '필수 항목을 모두 입력해주세요.' },
                { status: 400 }
            );
        }

        // 역할 검증
        if (role !== 'pastor' && role !== 'elder') {
            return NextResponse.json(
                { success: false, error: '올바른 역할을 선택해주세요.' },
                { status: 400 }
            );
        }

        // 기본 비밀번호 설정
        const defaultPassword = 'presbytery2024';
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);

        // 고유 사용자명 생성 (role_timestamp)
        const username = `${role}_${Date.now()}`;

        const member = await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                name,
                churchName,
                position,
                phone: phone || '010-0000-0000', // 연락처가 없으면 기본값 사용
                role,
                isApproved: true
            },
            select: {
                id: true,
                name: true,
                churchName: true,
                position: true,
                phone: true,
                role: true,
                createdAt: true
            }
        });

        return NextResponse.json({
            success: true,
            data: member,
            message: '회원이 추가되었습니다.'
        }, { status: 201 });

    } catch (error) {
        console.error('회원 추가 오류:', error);
        return NextResponse.json(
            { success: false, error: '회원 추가 중 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}
