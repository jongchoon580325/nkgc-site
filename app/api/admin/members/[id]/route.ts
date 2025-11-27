import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PUT: 정회원 정보 수정
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const memberId = parseInt(params.id);
        const body = await request.json();
        const { name, churchName, position, phone, role } = body;

        // 필수 항목 검증
        if (!name || !churchName || !position || !phone || !role) {
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

        const member = await prisma.user.update({
            where: { id: memberId },
            data: {
                name,
                churchName,
                position,
                phone,
                role
            },
            select: {
                id: true,
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

// DELETE: 정회원 삭제
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const memberId = parseInt(params.id);

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
