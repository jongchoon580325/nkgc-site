import { NextRequest, NextResponse } from 'next/server';
import { LocalStorageProvider } from '@/lib/services/storage/LocalStorageProvider';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

// Max file size 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;
        const folderId = formData.get('folderId') as string | null;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json({ error: "File too large (Max 10MB)" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        // De-duplication Check
        const hash = crypto.createHash('sha256').update(buffer).digest('hex');
        const existing = await prisma.fileAsset.findUnique({ where: { hash } });

        // If exact file exists, return it
        if (existing) {
            return NextResponse.json({
                message: "File exists",
                success: true,
                asset: existing,
                fileUrl: existing.path
            });
        }

        // Storage
        // Use a safe name to prevent issues, but try to keep original name part
        const sanitizedOriginalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const safeName = `${crypto.randomUUID().slice(0, 8)}-${sanitizedOriginalName}`;

        const storage = new LocalStorageProvider();

        // upload returns public URL path (e.g. /uploads/2024/12/abc.webp)
        const publicPath = await storage.upload(buffer, safeName, file.type);

        // Database Record
        const newAsset = await prisma.fileAsset.create({
            data: {
                filename: file.name,
                storedName: safeName,
                mimeType: file.type.startsWith('image/') ? 'image/webp' : file.type, // Sharp converts to webp in Provider
                size: buffer.length,
                path: publicPath,
                provider: 'local',
                hash: hash,
                folderId: folderId || null,
                // uploadedBy // TODO: Add session user ID when auth is fully integrated
            }
        });

        return NextResponse.json({
            success: true,
            asset: newAsset,
            fileUrl: newAsset.path
        }, { status: 201 });

    } catch (error) {
        console.error("Upload Error:", error);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
