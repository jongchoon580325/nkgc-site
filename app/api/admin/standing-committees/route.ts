import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: 상비부 목록 조회 (관리자용)
export async function GET(request: NextRequest) {
    try {
        const committees = await prisma.standingCommittee.findMany({
            orderBy: {
                displayOrder: 'asc'
            }
        });

        return NextResponse.json({
            success: true,
            data: committees
        });
    } catch (error) {
        console.error('상비부 목록 조회 오류:', error);
        return NextResponse.json(
            { success: false, error: '데이터를 불러올 수 없습니다.' },
            { status: 500 }
        );
    }
}

// POST: 상비부 추가
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, headTitle, head, headRole, secretary, secretaryRole, members, term, displayOrder } = body;

        // 필수 항목 검증
        if (!name || !headTitle || !head || !headRole || !secretary || !secretaryRole || !term) {
            return NextResponse.json(
                { success: false, error: '필수 항목을 모두 입력해주세요.' },
                { status: 400 }
            );
        }

        const committee = await prisma.standingCommittee.create({
            data: {
                name,
                headTitle,
                head,
                headRole,
                secretary,
                secretaryRole,
                members: members || '',
                term,
                displayOrder: displayOrder || 999
            }
        });

        return NextResponse.json({
            success: true,
            data: committee,
            message: '상비부가 추가되었습니다.'
        }, { status: 201 });

    } catch (error) {
        console.error('상비부 추가 오류:', error);
        return NextResponse.json(
            { success: false, error: '상비부 추가 중 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}
