import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { username, password, name, phone, churchName, position, email } = body;

        // 유효성 검사
        if (!username || !password || !name || !phone || !churchName || !position) {
            return NextResponse.json(
                { success: false, error: '필수 항목을 모두 입력해주세요.' },
                { status: 400 }
            );
        }

        // 중복 확인
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { username },
                    { phone }
                ]
            }
        });

        if (existingUser) {
            return NextResponse.json(
                { success: false, error: '이미 사용 중인 아이디 또는 연락처입니다.' },
                { status: 400 }
            );
        }

        // 비밀번호 해싱
        const hashedPassword = await bcrypt.hash(password, 10);

        // 사용자 생성 (승인 대기 상태)
        const user = await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                name,
                phone,
                churchName,
                position,
                email: email || null,
                role: 'pending',
                isApproved: false
            }
        });

        return NextResponse.json({
            success: true,
            message: '회원가입 신청이 완료되었습니다.'
        }, { status: 201 });

    } catch (error) {
        console.error('회원가입 오류:', error);
        return NextResponse.json(
            { success: false, error: '회원가입 처리 중 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}
