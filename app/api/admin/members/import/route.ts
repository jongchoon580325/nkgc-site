import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// POST: CSV Import Members
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        const userRole = session?.user?.role;
        if (!session || (userRole !== 'admin' && userRole !== 'ADMIN')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { members } = body;

        if (!members || !Array.isArray(members)) {
            return NextResponse.json(
                { success: false, error: 'Invalid members data' },
                { status: 400 }
            );
        }

        let count = 0;

        for (const member of members) {
            const { name, churchName, position, role } = member;

            if (!name) continue;

            try {
                await prisma.user.create({
                    data: {
                        username: `${name}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // Generate unique username
                        password: '$2a$10$PlaceholderPasswordForCSVImport', // Placeholder password
                        name: name,
                        email: null,
                        phone: '',
                        churchName: churchName || '',
                        position: position || '',
                        role: role || 'member',
                        isApproved: true,
                    },
                });
                count++;
            } catch (error) {
                console.error(`Failed to import member ${name}:`, error);
                // Continue with next member
            }
        }

        return NextResponse.json({
            success: true,
            count,
            message: `${count}명의 회원을 가져왔습니다.`
        });
    } catch (error) {
        console.error('CSV Import error:', error);
        return NextResponse.json(
            { success: false, error: 'CSV 가져오기 중 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}
