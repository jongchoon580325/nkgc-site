import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

const dataFilePath = path.join(process.cwd(), 'data', 'organizations.json')

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        const fileContents = await fs.readFile(dataFilePath, 'utf8')
        const data = JSON.parse(fileContents)

        if (id) {
            const organization = data.organizations.find((org: any) => org.id === id)
            if (!organization) {
                return NextResponse.json(
                    { error: 'Organization not found' },
                    { status: 404 }
                )
            }
            return NextResponse.json(organization)
        }

        return NextResponse.json(data)
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to read organizations data' },
            { status: 500 }
        )
    }
}

export async function POST(request: Request) {
    try {
        const updatedOrg = await request.json()
        const fileContents = await fs.readFile(dataFilePath, 'utf8')
        const data = JSON.parse(fileContents)

        const index = data.organizations.findIndex(
            (org: any) => org.id === updatedOrg.id
        )

        if (index === -1) {
            return NextResponse.json(
                { error: 'Organization not found' },
                { status: 404 }
            )
        }

        data.organizations[index] = updatedOrg

        await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2), 'utf8')

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to update organizations data' },
            { status: 500 }
        )
    }
}
