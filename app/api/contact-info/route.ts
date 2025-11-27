import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

const dataFilePath = path.join(process.cwd(), 'data', 'contact-info.json')

// GET: Fetch contact info
export async function GET() {
    try {
        const fileContents = await fs.readFile(dataFilePath, 'utf8')
        const data = JSON.parse(fileContents)
        return NextResponse.json(data)
    } catch (error) {
        console.error('Error reading contact info:', error)
        return NextResponse.json(
            { error: 'Failed to load contact info' },
            { status: 500 }
        )
    }
}

// POST: Update contact info
export async function POST(request: Request) {
    try {
        const data = await request.json()

        // Validate data structure
        if (!data.secretary || !data.president || !data.address || !data.email) {
            return NextResponse.json(
                { error: 'Invalid data structure' },
                { status: 400 }
            )
        }

        await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2), 'utf8')

        return NextResponse.json({ success: true, data })
    } catch (error) {
        console.error('Error updating contact info:', error)
        return NextResponse.json(
            { error: 'Failed to update contact info' },
            { status: 500 }
        )
    }
}
