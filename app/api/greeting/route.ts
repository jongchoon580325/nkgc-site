import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

export async function GET() {
    try {
        const filePath = path.join(process.cwd(), 'data', 'president.json')
        const fileContents = await fs.readFile(filePath, 'utf8')
        const data = JSON.parse(fileContents)
        return NextResponse.json(data)
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to read president data' },
            { status: 500 }
        )
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const filePath = path.join(process.cwd(), 'data', 'president.json')

        // Validate required fields
        if (!body.name || !body.church || !body.term) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        await fs.writeFile(filePath, JSON.stringify(body, null, 2), 'utf8')
        return NextResponse.json({ success: true, data: body })
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to update president data' },
            { status: 500 }
        )
    }
}
