import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

export async function GET(request: NextRequest) {
    const token = request.cookies.get('admin_token')?.value

    if (!token) {
        return NextResponse.json({ isLoggedIn: false })
    }

    try {
        const secret = new TextEncoder().encode(
            process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'
        )
        await jwtVerify(token, secret)
        return NextResponse.json({ isLoggedIn: true })
    } catch (error) {
        return NextResponse.json({ isLoggedIn: false })
    }
}
