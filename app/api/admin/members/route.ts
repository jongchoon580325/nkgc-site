import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

export const dynamic = 'force-dynamic';

// GET: 회원 목록 조회 (관리자용) - 모든 승인된 회원
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const memberType = searchParams.get('memberType'); // 'all', 'member', 'guest'
        const search = searchParams.get('search');

        const where: any = {
            isApproved: true,
            // 관리자(super_admin, admin)는 제외
            role: { notIn: ['super_admin', 'admin'] }
        };

        // 회원 유형 필터 (한글 직분명 기준)
        if (memberType === 'member') {
            // 정회원 (목사/장로)
            where.position = { in: ['목사', '장로', 'pastor', 'elder'] };
        } else if (memberType === 'guest') {
            // 일반회원 (전도사/일반교인)
            where.position = { in: ['전도사', '교인', '일반교인', 'evangelist', 'member'] };
        }
        // 'all'이거나 없으면 전체 조회 (관리자 제외)

        // 검색 필터
        if (search) {
            where.OR = [
                { name: { contains: search } },
                { churchName: { contains: search } },
                { phone: { contains: search } }
            ];
        }

        const members = await prisma.user.findMany({
            where,
            select: {
                id: true,
                username: true,
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
        console.error('회원 목록 조회 오류:', error);
        return NextResponse.json(
            { success: false, error: '데이터를 불러올 수 없습니다.' },
            { status: 500 }
        );
    }
}

// POST: 회원 추가
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { username, password, name, churchName, position, phone, role } = body;

        // 필수 항목 검증
        if (!username || !password || !name || !churchName || !position) {
            return NextResponse.json(
                { success: false, error: '필수 항목을 모두 입력해주세요.' },
                { status: 400 }
            );
        }

        // 직분 검증
        const validPositions = ['pastor', 'elder', 'evangelist', 'member'];
        if (!validPositions.includes(position)) {
            return NextResponse.json(
                { success: false, error: '올바른 직분을 선택해주세요.' },
                { status: 400 }
            );
        }

        // 아이디 중복 확인
        const existingUser = await prisma.user.findUnique({
            where: { username }
        });

        if (existingUser) {
            return NextResponse.json(
                { success: false, error: '이미 사용 중인 아이디입니다.' },
                { status: 400 }
            );
        }

        // 비밀번호 해싱
        const hashedPassword = await bcrypt.hash(password, 10);

        // 직분에 따른 기본 권한 설정
        // 목사/장로 -> member(정회원), 그 외 -> guest(일반회원)
        const defaultRole = (position === 'pastor' || position === 'elder') ? 'member' : 'guest';
        const finalRole = role || defaultRole;

        const member = await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                name,
                churchName,
                position,
                phone: phone || '010-0000-0000',
                role: finalRole,
                isApproved: true,
                approvedAt: new Date()
            },
            select: {
                id: true,
                username: true,
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

