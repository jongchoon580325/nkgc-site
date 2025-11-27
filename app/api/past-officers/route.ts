import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

export async function GET() {
    try {
        const filePath = path.join(process.cwd(), 'data', 'past-officers.json')
        const fileContents = await fs.readFile(filePath, 'utf8')
        const data = JSON.parse(fileContents)
        return NextResponse.json(data)
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to read past officers data' },
            { status: 500 }
        )
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const filePath = path.join(process.cwd(), 'data', 'past-officers.json')

        // Validate required fields
        if (!Array.isArray(body.years)) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        await fs.writeFile(filePath, JSON.stringify(body, null, 2), 'utf8')
        return NextResponse.json({ success: true, data: body })
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to update past officers data' },
            { status: 500 }
        )
    }
}
