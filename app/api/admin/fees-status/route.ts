import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: 상회비 목록 조회
export async function GET(request: NextRequest) {
    try {
        const fees = await prisma.feeStatus.findMany({
            orderBy: [
                { inspection: 'asc' },
                { churchName: 'asc' }
            ]
        });

        return NextResponse.json({
            success: true,
            data: fees
        });
    } catch (error) {
        console.error('상회비 목록 조회 오류:', error);
        return NextResponse.json(
            { success: false, error: '데이터를 불러올 수 없습니다.' },
            { status: 500 }
        );
    }
}

// POST: 상회비 추가
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            inspection,
            churchName,
            pastorName,
            monthlyFee,
            annualFee
        } = body;

        if (!inspection || !churchName) {
            return NextResponse.json(
                { success: false, error: '시찰과 교회명은 필수 항목입니다.' },
                { status: 400 }
            );
        }

        const fee = await prisma.feeStatus.create({
            data: {
                inspection,
                churchName,
                pastorName: pastorName || '',
                monthlyFee: parseInt(monthlyFee) || 0,
                annualFee: parseInt(annualFee) || 0
            }
        });

        return NextResponse.json({
            success: true,
            data: fee
        });
    } catch (error) {
        console.error('상회비 추가 오류:', error);
        return NextResponse.json(
            { success: false, error: '추가에 실패했습니다.' },
            { status: 500 }
        );
    }
}
