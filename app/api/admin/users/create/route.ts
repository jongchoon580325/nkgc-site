import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

// POST: 관리자가 직접 회원 등록
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            username,
            password,
            name,
            phone,
            churchName,
            position,
            email,
            role,
            isApproved
        } = body;

        // 필수 항목 검증
        if (!username || !password || !name || !phone || !churchName || !position) {
            return NextResponse.json(
                { success: false, error: '필수 항목을 모두 입력해주세요.' },
                { status: 400 }
            );
        }

        // 아이디 중복 확인
        const existingUsername = await prisma.user.findUnique({
            where: { username }
        });

        if (existingUsername) {
            return NextResponse.json(
                { success: false, error: '이미 사용 중인 아이디입니다.' },
                { status: 400 }
            );
        }

        // 연락처 중복 확인
        const existingPhone = await prisma.user.findFirst({
            where: { phone }
        });

        if (existingPhone) {
            return NextResponse.json(
                { success: false, error: '이미 등록된 연락처입니다.' },
                { status: 400 }
            );
        }

        // 비밀번호 해싱
        const hashedPassword = await bcrypt.hash(password, 10);

        // 권한 자동 설정 (관리자가 직접 등록하면 바로 승인)
        const userRole = role || position;
        const approved = isApproved !== undefined ? isApproved : true;

        // 회원 생성
        const user = await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                name,
                phone,
                churchName,
                position,
                email: email || null,
                role: userRole,
                isApproved: approved,
                approvedAt: approved ? new Date() : null
            },
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
                createdAt: true
            }
        });

        return NextResponse.json({
            success: true,
            data: user,
            message: '회원이 등록되었습니다.'
        }, { status: 201 });

    } catch (error) {
        console.error('회원 등록 오류:', error);
        return NextResponse.json(
            { success: false, error: '회원 등록 중 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}
