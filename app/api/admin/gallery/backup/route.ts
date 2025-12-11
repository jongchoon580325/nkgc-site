import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as fs from 'fs';
import * as path from 'path';
import archiver from 'archiver';
import AdmZip from 'adm-zip';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

// 대용량 파일 업로드를 위한 설정
export const config = {
    api: {
        bodyParser: false,
    },
};

// GET: 갤러리 데이터 내보내기 (JSON + 이미지 ZIP)
export async function GET(request: NextRequest) {
    try {
        // 1. 갤러리 게시글 조회
        const posts = await prisma.post.findMany({
            where: { boardType: 'GALLERY' },
            include: {
                attachments: true,
                author: {
                    select: { name: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // 2. 갤러리 설정 조회
        let settings = null;
        try {
            const boardSettings = await prisma.boardSettings.findUnique({
                where: { boardType: 'GALLERY' }
            });
            if (boardSettings?.settings) {
                settings = JSON.parse(boardSettings.settings);
            }
        } catch {
            settings = null;
        }

        // 3. ZIP 아카이브 생성
        const archive = archiver('zip', { zlib: { level: 9 } });
        const chunks: Buffer[] = [];

        archive.on('data', (chunk: Buffer) => chunks.push(chunk));

        // 4. 메타데이터 JSON 생성
        const metadata = {
            exportedAt: new Date().toISOString(),
            version: '1.0',
            type: 'gallery',
            settings,
            postsCount: posts.length,
            posts: posts.map(post => ({
                title: post.title,
                content: post.content,
                authorName: post.authorName || post.author?.name || 'Unknown',
                viewCount: post.viewCount,
                isNotice: post.isNotice,
                category: post.category,
                createdAt: post.createdAt.toISOString(),
                attachments: post.attachments.map(att => ({
                    originalFileName: att.fileName,
                    backupFileName: `post_${post.id}/${att.fileName}`,
                    fileSize: att.fileSize,
                    mimeType: att.mimeType
                }))
            }))
        };

        archive.append(JSON.stringify(metadata, null, 2), { name: 'metadata.json' });

        // 5. 첨부파일들을 ZIP에 추가
        for (const post of posts) {
            for (const attachment of post.attachments) {
                const filePath = path.join(process.cwd(), 'public', attachment.fileUrl);
                if (fs.existsSync(filePath)) {
                    archive.file(filePath, { name: `uploads/post_${post.id}/${attachment.fileName}` });
                }
            }
        }

        await archive.finalize();

        // ZIP 완료 대기
        await new Promise<void>((resolve) => {
            archive.on('end', () => resolve());
        });

        const buffer = Buffer.concat(chunks);
        const dateStr = new Date().toISOString().split('T')[0];

        return new NextResponse(buffer, {
            headers: {
                'Content-Type': 'application/zip',
                'Content-Disposition': `attachment; filename=gallery_backup_${dateStr}.zip`
            }
        });

    } catch (error) {
        console.error('Gallery export error:', error);
        return NextResponse.json(
            { success: false, error: '내보내기 중 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}

// POST: 갤러리 데이터 가져오기 (ZIP 파일)
export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const mode = (formData.get('mode') as string) || 'merge';
        const authorId = parseInt(formData.get('authorId') as string) || 1;

        if (!file) {
            return NextResponse.json(
                { success: false, error: '파일이 없습니다.' },
                { status: 400 }
            );
        }

        // 1. ZIP 파일 읽기
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const zip = new AdmZip(buffer);
        const zipEntries = zip.getEntries();

        // 2. metadata.json 찾기
        const metadataEntry = zipEntries.find(entry => entry.entryName === 'metadata.json');
        if (!metadataEntry) {
            return NextResponse.json(
                { success: false, error: 'metadata.json 파일을 찾을 수 없습니다.' },
                { status: 400 }
            );
        }

        const metadataContent = metadataEntry.getData().toString('utf8');
        const metadata = JSON.parse(metadataContent);

        if (metadata.type !== 'gallery') {
            return NextResponse.json(
                { success: false, error: '갤러리 백업 파일이 아닙니다.' },
                { status: 400 }
            );
        }

        // 3. 덮어쓰기 모드: 기존 데이터 삭제
        if (mode === 'overwrite') {
            // 기존 첨부파일 삭제
            const existingPosts = await prisma.post.findMany({
                where: { boardType: 'GALLERY' },
                include: { attachments: true }
            });

            for (const post of existingPosts) {
                for (const att of post.attachments) {
                    const filePath = path.join(process.cwd(), 'public', att.fileUrl);
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                    }
                }
            }

            // 기존 게시글 삭제 (첨부파일은 cascade로 삭제됨)
            await prisma.post.deleteMany({
                where: { boardType: 'GALLERY' }
            });
        }

        // 4. 설정 복원
        if (metadata.settings) {
            await prisma.boardSettings.upsert({
                where: { boardType: 'GALLERY' },
                update: { settings: JSON.stringify(metadata.settings) },
                create: {
                    boardType: 'GALLERY',
                    settings: JSON.stringify(metadata.settings)
                }
            });
        }

        // 5. 게시글 및 첨부파일 복원
        let imported = 0;
        let skipped = 0;

        for (let i = 0; i < metadata.posts.length; i++) {
            const postData = metadata.posts[i];

            // 중복 체크 (병합 모드)
            if (mode === 'merge') {
                const existing = await prisma.post.findFirst({
                    where: {
                        boardType: 'GALLERY',
                        title: postData.title,
                        createdAt: new Date(postData.createdAt)
                    }
                });

                if (existing) {
                    skipped++;
                    continue;
                }
            }

            // 게시글 생성
            const newPost = await prisma.post.create({
                data: {
                    boardType: 'GALLERY',
                    title: postData.title,
                    content: postData.content,
                    authorId: authorId,
                    authorName: postData.authorName,
                    viewCount: postData.viewCount || 0,
                    isNotice: postData.isNotice || false,
                    category: postData.category
                }
            });

            // 첨부파일 복원
            for (const attData of postData.attachments) {
                const zipFilePath = `uploads/${attData.backupFileName}`;
                const fileEntry = zipEntries.find(entry => entry.entryName === zipFilePath);

                if (fileEntry) {
                    // 새 파일명 생성 (충돌 방지)
                    const ext = path.extname(attData.originalFileName);
                    const newFileName = `${uuidv4()}${ext}`;
                    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'gallery');

                    // 디렉토리 생성
                    if (!fs.existsSync(uploadDir)) {
                        fs.mkdirSync(uploadDir, { recursive: true });
                    }

                    // 파일 저장
                    const filePath = path.join(uploadDir, newFileName);
                    fs.writeFileSync(filePath, fileEntry.getData());

                    // 첨부파일 레코드 생성
                    await prisma.attachment.create({
                        data: {
                            postId: newPost.id,
                            fileName: attData.originalFileName,
                            fileUrl: `/uploads/gallery/${newFileName}`,
                            fileSize: attData.fileSize || 0,
                            mimeType: attData.mimeType
                        }
                    });
                }
            }

            imported++;
        }

        return NextResponse.json({
            success: true,
            message: `가져오기 완료: ${imported}개 게시글 추가, ${skipped}개 건너뜀`,
            imported,
            skipped
        });

    } catch (error) {
        console.error('Gallery import error:', error);
        return NextResponse.json(
            { success: false, error: '가져오기 중 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}
