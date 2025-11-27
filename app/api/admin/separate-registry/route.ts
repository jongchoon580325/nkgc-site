import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: 별명부 목록 조회
export async function GET(request: NextRequest) {
    try {
        const registries = await prisma.separateRegistry.findMany({
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json({
            success: true,
            data: registries
        });
    } catch (error) {
        console.error('별명부 목록 조회 오류:', error);
        return NextResponse.json(
            { success: false, error: '데이터를 불러올 수 없습니다.' },
            { status: 500 }
        );
    }
}

// POST: 별명부 추가
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            name,
            position,
            birthDate,
            registrationDate,
            registrationReason,
            cancellationDate,
            cancellationReason
        } = body;

        if (!name || !position) {
            return NextResponse.json(
                { success: false, error: '이름과 직분은 필수 항목입니다.' },
                { status: 400 }
            );
        }

        const registry = await prisma.separateRegistry.create({
            data: {
                name,
                position,
                birthDate: birthDate || '',
                registrationDate: registrationDate || '',
                registrationReason: registrationReason || '',
                cancellationDate: cancellationDate || '',
                cancellationReason: cancellationReason || ''
            }
        });

        return NextResponse.json({
            success: true,
            data: registry
        });
    } catch (error) {
        console.error('별명부 추가 오류:', error);
        return NextResponse.json(
            { success: false, error: '추가에 실패했습니다.' },
            { status: 500 }
        );
    }
}
