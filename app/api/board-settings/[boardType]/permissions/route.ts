
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(
    request: NextRequest,
    props: { params: Promise<{ boardType: string }> }
) {
    const params = await props.params;
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user.role !== 'admin' && session.user.role !== 'ADMIN')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const permissions = await prisma.boardPermission.findMany({
            where: { boardType: params.boardType }
        });

        // Transform to convenient structure
        const formatted = permissions.map(p => ({
            role: p.role,
            actions: JSON.parse(p.actions)
        }));

        return NextResponse.json({ permissions: formatted });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(
    request: NextRequest,
    props: { params: Promise<{ boardType: string }> }
) {
    const params = await props.params;
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user.role !== 'admin' && session.user.role !== 'ADMIN')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { permissions } = body;
        // permissions: { role: string, actions: string[] }[]

        const boardType = params.boardType;

        // Use transaction to upsert
        await prisma.$transaction(async (tx) => {
            for (const p of permissions) {
                const actionsJson = JSON.stringify(p.actions);

                // Upsert
                const existing = await tx.boardPermission.findUnique({
                    where: {
                        boardType_role: { boardType, role: p.role }
                    }
                });

                if (existing) {
                    await tx.boardPermission.update({
                        where: { id: existing.id },
                        data: { actions: actionsJson }
                    });
                } else {
                    await tx.boardPermission.create({
                        data: {
                            boardType,
                            role: p.role,
                            actions: actionsJson
                        }
                    });
                }
            }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Permission save error:', error);
        return NextResponse.json({ error: error.message || String(error) }, { status: 500 });
    }
}
