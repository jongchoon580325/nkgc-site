import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: 설정 조회
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const key = searchParams.get('key');

        if (key) {
            const setting = await prisma.settings.findUnique({
                where: { key }
            });

            if (!setting) {
                return NextResponse.json(
                    { success: false, error: '설정을 찾을 수 없습니다.' },
                    { status: 404 }
                );
            }

            return NextResponse.json({
                success: true,
                data: setting
            });
        }

        // 모든 설정 조회
        const settings = await prisma.settings.findMany();
        return NextResponse.json({
            success: true,
            data: settings
        });
    } catch (error) {
        console.error('설정 조회 오류:', error);
        return NextResponse.json(
            { success: false, error: '설정을 불러올 수 없습니다.' },
            { status: 500 }
        );
    }
}

// PUT: 설정 업데이트
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { key, value } = body;

        if (!key || value === undefined) {
            return NextResponse.json(
                { success: false, error: '필수 항목을 입력해주세요.' },
                { status: 400 }
            );
        }

        const setting = await prisma.settings.upsert({
            where: { key },
            update: { value },
            create: { key, value }
        });

        return NextResponse.json({
            success: true,
            data: setting,
            message: '설정이 업데이트되었습니다.'
        });
    } catch (error) {
        console.error('설정 업데이트 오류:', error);
        return NextResponse.json(
            { success: false, error: '설정 업데이트에 실패했습니다.' },
            { status: 500 }
        );
    }
}
