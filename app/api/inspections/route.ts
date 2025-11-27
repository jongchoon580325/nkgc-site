import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

export async function GET() {
    try {
        const filePath = path.join(process.cwd(), 'data', 'inspections.json')
        const fileContents = await fs.readFile(filePath, 'utf8')
        const data = JSON.parse(fileContents)
        return NextResponse.json(data)
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to read inspections data' },
            { status: 500 }
        )
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const filePath = path.join(process.cwd(), 'data', 'inspections.json')

        // Validate that it's an array
        if (!Array.isArray(body)) {
            return NextResponse.json(
                { error: 'Data must be an array of inspections' },
                { status: 400 }
            )
        }

        // Validate each inspection has required fields
        for (const inspection of body) {
            if (
                !inspection.id ||
                !inspection.name ||
                !inspection.leader ||
                !inspection.secretary ||
                !Array.isArray(inspection.churches)
            ) {
                return NextResponse.json(
                    { error: 'Invalid inspection data structure' },
                    { status: 400 }
                )
            }
        }

        await fs.writeFile(filePath, JSON.stringify(body, null, 2), 'utf8')
        return NextResponse.json({ success: true, data: body })
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to update inspections data' },
            { status: 500 }
        )
    }
}
