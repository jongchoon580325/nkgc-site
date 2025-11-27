import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({ message: 'Session refresh endpoint' });
}

export async function POST() {
    // This endpoint can be used to force session refresh
    return NextResponse.json({ success: true });
}
