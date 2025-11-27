import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

// GET: 특정 회원 조회
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const userId = parseInt(params.id);

        const user = await prisma.user.findUnique({
            where: { id: userId },
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
                updatedAt: true,
                lastLoginAt: true
            }
        });

        if (!user) {
            return NextResponse.json(
                { success: false, error: '회원을 찾을 수 없습니다.' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: user
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
    { params }: { params: { id: string } }
) {
    try {
        const userId = parseInt(params.id);
        const body = await request.json();
        const { name, phone, email, churchName, position, role, password } = body;

        const updateData: any = {};

        if (name) updateData.name = name;
        if (phone) updateData.phone = phone;
        if (email !== undefined) updateData.email = email || null;
        if (churchName) updateData.churchName = churchName;
        if (position) updateData.position = position;
        if (role) updateData.role = role;

        // 비밀번호 변경
        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        const user = await prisma.user.update({
            where: { id: userId },
            data: updateData,
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
                updatedAt: true
            }
        });

        return NextResponse.json({
            success: true,
            data: user,
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
    { params }: { params: { id: string } }
) {
    try {
        const userId = parseInt(params.id);

        await prisma.user.delete({
            where: { id: userId }
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
