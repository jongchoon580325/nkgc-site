import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

// GET: 단일 회원 조회
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const memberId = parseInt(id);

        const member = await prisma.user.findUnique({
            where: { id: memberId },
            select: {
                id: true,
                username: true,
                name: true,
                churchName: true,
                position: true,
                category: true,
                phone: true,
                role: true,
                isApproved: true,
                createdAt: true
            }
        });

        if (!member) {
            return NextResponse.json(
                { success: false, error: '회원을 찾을 수 없습니다.' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: member
        });
    } catch (error) {
        console.error('회원 조회 오류:', error);
        return NextResponse.json(
            { success: false, error: '회원 정보를 불러올 수 없습니다.' },
            { status: 500 }
        );
    }
}

// PUT: 회원 정보 수정
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const memberId = parseInt(id);
        const body = await request.json();
        const { name, churchName, position, category, phone, role, password, username } = body;

        // 필수 항목 검증
        if (!name || !churchName || !position || !phone) {
            return NextResponse.json(
                { success: false, error: '필수 항목을 모두 입력해주세요.' },
                { status: 400 }
            );
        }

        // 역할 검증 (새 권한 체계)
        const validRoles = ['super_admin', 'admin', 'member', 'guest', 'pending'];
        if (role && !validRoles.includes(role)) {
            return NextResponse.json(
                { success: false, error: '올바른 권한을 선택해주세요.' },
                { status: 400 }
            );
        }

        // 업데이트 데이터 준비
        const updateData: any = {
            name,
            churchName,
            position,
            phone
        };

        // category가 제공된 경우 업데이트
        if (category !== undefined) {
            updateData.category = category || null;
        }

        // role이 제공된 경우에만 업데이트
        if (role) {
            updateData.role = role;
        }

        // username이 제공된 경우 중복 체크 후 업데이트
        if (username && username.trim() !== '') {
            // 다른 사용자가 이미 사용 중인지 확인
            const existingUser = await prisma.user.findFirst({
                where: {
                    username: username,
                    NOT: { id: memberId }
                }
            });

            if (existingUser) {
                return NextResponse.json(
                    { success: false, error: '이미 사용 중인 아이디입니다.' },
                    { status: 400 }
                );
            }

            updateData.username = username;
        }

        // 비밀번호가 제공된 경우에만 업데이트 (해싱)
        if (password && password.trim() !== '') {
            updateData.password = await bcrypt.hash(password, 10);
        }

        const member = await prisma.user.update({
            where: { id: memberId },
            data: updateData,
            select: {
                id: true,
                username: true,
                name: true,
                churchName: true,
                position: true,
                phone: true,
                role: true,
                updatedAt: true
            }
        });

        return NextResponse.json({
            success: true,
            data: member,
            message: '회원 정보가 수정되었습니다.'
        });
    } catch (error) {
        console.error('회원 수정 오류:', error);
        return NextResponse.json(
            { success: false, error: '회원 정보 수정에 실패했습니다.' },
            { status: 500 }
        );
    }
}

// DELETE: 회원 삭제
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const memberId = parseInt(id);

        await prisma.user.delete({
            where: { id: memberId }
        });

        return NextResponse.json({
            success: true,
            message: '회원이 삭제되었습니다.'
        });
    } catch (error) {
        console.error('회원 삭제 오류:', error);
        return NextResponse.json(
            { success: false, error: '회원 삭제에 실패했습니다.' },
            { status: 500 }
        );
    }
}

