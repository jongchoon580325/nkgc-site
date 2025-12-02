import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import path from 'path';
import fs from 'fs/promises';

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;

        // Get attachment metadata from database
        const attachment = await prisma.attachment.findUnique({
            where: { id: parseInt(id) },
        });

        if (!attachment) {
            return new NextResponse('Attachment not found', { status: 404 });
        }

        // Try to find the file in the public directory
        // The fileUrl is like: /wp-content/uploads/kboard_attached/2/202509/68d24c41d3c353839887.hwp
        const publicPath = path.join(process.cwd(), 'public', attachment.fileUrl);

        try {
            // Check if file exists
            await fs.access(publicPath);

            // Read the file
            const fileBuffer = await fs.readFile(publicPath);

            // Determine MIME type
            const ext = path.extname(attachment.fileName).toLowerCase();
            const mimeTypes: Record<string, string> = {
                '.hwp': 'application/x-hwp',
                '.pdf': 'application/pdf',
                '.doc': 'application/msword',
                '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                '.xls': 'application/vnd.ms-excel',
                '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg',
                '.png': 'image/png',
                '.gif': 'image/gif',
                '.zip': 'application/zip',
            };

            const mimeType = mimeTypes[ext] || 'application/octet-stream';

            // Return file with appropriate headers
            return new NextResponse(fileBuffer, {
                status: 200,
                headers: {
                    'Content-Type': mimeType,
                    'Content-Disposition': `attachment; filename="${encodeURIComponent(attachment.fileName)}"`,
                    'Content-Length': fileBuffer.length.toString(),
                },
            });
        } catch (fileError) {
            // File doesn't exist in public directory
            console.error(`File not found: ${publicPath}`, fileError);

            return new NextResponse(
                `파일을 찾을 수 없습니다. 관리자에게 문의하세요.\n\n경로: ${attachment.fileUrl}\n파일명: ${attachment.fileName}`,
                {
                    status: 404,
                    headers: {
                        'Content-Type': 'text/plain; charset=utf-8',
                    }
                }
            );
        }
    } catch (error) {
        console.error('Error downloading attachment:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
