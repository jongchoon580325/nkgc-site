import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as fs from 'fs';
import * as path from 'path';
import archiver from 'archiver';
import { Readable } from 'stream';

export const dynamic = 'force-dynamic';

// GET: 결의서 데이터 내보내기 (JSON + 파일 ZIP)
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const format = searchParams.get('format') || 'json';

        // 모든 결의서 데이터 조회
        const resolutions = await prisma.resolution.findMany({
            orderBy: [
                { tabType: 'asc' },
                { meetingNum: 'asc' }
            ]
        });

        if (format === 'json') {
            // JSON만 내보내기 (파일 URL 포함)
            const exportData = {
                exportedAt: new Date().toISOString(),
                version: '1.0',
                count: resolutions.length,
                data: resolutions.map(r => ({
                    tabType: r.tabType,
                    meetingNum: r.meetingNum,
                    sessionNum: r.sessionNum,
                    meetingType: r.meetingType,
                    title: r.title,
                    fileType: r.fileType,
                    fileName: r.fileName,
                    fileUrl: r.fileUrl,
                    displayOrder: r.displayOrder
                }))
            };

            return new NextResponse(JSON.stringify(exportData, null, 2), {
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Disposition': `attachment; filename=resolutions_export_${new Date().toISOString().split('T')[0]}.json`
                }
            });
        }

        // ZIP 형식 (메타데이터 + 파일)
        const archive = archiver('zip', { zlib: { level: 9 } });
        const chunks: Buffer[] = [];

        archive.on('data', (chunk: Buffer) => chunks.push(chunk));

        // 메타데이터 JSON 추가
        const metadata = {
            exportedAt: new Date().toISOString(),
            version: '1.0',
            count: resolutions.length,
            data: resolutions.map(r => ({
                tabType: r.tabType,
                meetingNum: r.meetingNum,
                sessionNum: r.sessionNum,
                meetingType: r.meetingType,
                title: r.title,
                fileType: r.fileType,
                fileName: r.fileName,
                originalFileUrl: r.fileUrl
            }))
        };

        archive.append(JSON.stringify(metadata, null, 2), { name: 'metadata.json' });

        // 파일들 추가
        for (const resolution of resolutions) {
            const filePath = path.join(process.cwd(), 'public', resolution.fileUrl);
            if (fs.existsSync(filePath)) {
                archive.file(filePath, { name: `files/${resolution.fileName}` });
            }
        }

        await archive.finalize();

        // 모든 청크를 하나의 버퍼로 합치기
        await new Promise<void>((resolve) => {
            archive.on('end', () => resolve());
        });

        const buffer = Buffer.concat(chunks);

        return new NextResponse(buffer, {
            headers: {
                'Content-Type': 'application/zip',
                'Content-Disposition': `attachment; filename=resolutions_backup_${new Date().toISOString().split('T')[0]}.zip`
            }
        });

    } catch (error) {
        console.error('Export error:', error);
        return NextResponse.json(
            { success: false, error: '내보내기 중 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}

// POST: 결의서 데이터 가져오기
export async function POST(request: NextRequest) {
    try {
        const contentType = request.headers.get('content-type') || '';

        if (contentType.includes('application/json')) {
            // JSON 형식으로 가져오기 (메타데이터만)
            const body = await request.json();
            const { data, mode = 'merge' } = body;

            if (!data || !Array.isArray(data)) {
                return NextResponse.json(
                    { success: false, error: '유효하지 않은 데이터 형식입니다.' },
                    { status: 400 }
                );
            }

            let imported = 0;
            let skipped = 0;

            // 덮어쓰기 모드: 기존 데이터 삭제
            if (mode === 'overwrite') {
                await prisma.resolution.deleteMany({});
            }

            for (const item of data) {
                // 필수 필드 검증
                if (!item.tabType || !item.meetingNum || !item.title || !item.fileName || !item.fileUrl) {
                    skipped++;
                    continue;
                }

                // 중복 체크 (병합 모드)
                if (mode === 'merge') {
                    const existing = await prisma.resolution.findFirst({
                        where: {
                            meetingNum: item.meetingNum,
                            meetingType: item.meetingType || '정기',
                            sessionNum: item.sessionNum || null
                        }
                    });

                    if (existing) {
                        skipped++;
                        continue;
                    }
                }

                // 새 레코드 생성
                await prisma.resolution.create({
                    data: {
                        tabType: item.tabType,
                        meetingNum: parseInt(item.meetingNum),
                        sessionNum: item.sessionNum ? parseInt(item.sessionNum) : null,
                        meetingType: item.meetingType || '정기',
                        title: item.title,
                        fileType: item.fileType || 'PDF',
                        fileName: item.fileName,
                        fileUrl: item.fileUrl,
                        displayOrder: item.displayOrder || 0
                    }
                });

                imported++;
            }

            return NextResponse.json({
                success: true,
                message: `가져오기 완료: ${imported}건 추가, ${skipped}건 건너뜀`,
                imported,
                skipped
            });

        } else if (contentType.includes('multipart/form-data')) {
            // FormData 형식으로 가져오기 (JSON 파일 업로드)
            const formData = await request.formData();
            const file = formData.get('file') as File;
            const mode = (formData.get('mode') as string) || 'merge';

            if (!file) {
                return NextResponse.json(
                    { success: false, error: '파일이 없습니다.' },
                    { status: 400 }
                );
            }

            const text = await file.text();
            const jsonData = JSON.parse(text);

            const data = jsonData.data || jsonData;

            if (!Array.isArray(data)) {
                return NextResponse.json(
                    { success: false, error: '유효하지 않은 JSON 형식입니다.' },
                    { status: 400 }
                );
            }

            let imported = 0;
            let skipped = 0;

            if (mode === 'overwrite') {
                await prisma.resolution.deleteMany({});
            }

            for (const item of data) {
                if (!item.tabType || !item.meetingNum || !item.title || !item.fileName || !item.fileUrl) {
                    skipped++;
                    continue;
                }

                if (mode === 'merge') {
                    const existing = await prisma.resolution.findFirst({
                        where: {
                            meetingNum: parseInt(item.meetingNum),
                            meetingType: item.meetingType || '정기',
                            sessionNum: item.sessionNum ? parseInt(item.sessionNum) : null
                        }
                    });

                    if (existing) {
                        skipped++;
                        continue;
                    }
                }

                await prisma.resolution.create({
                    data: {
                        tabType: item.tabType,
                        meetingNum: parseInt(item.meetingNum),
                        sessionNum: item.sessionNum ? parseInt(item.sessionNum) : null,
                        meetingType: item.meetingType || '정기',
                        title: item.title,
                        fileType: item.fileType || 'PDF',
                        fileName: item.fileName,
                        fileUrl: item.fileUrl || item.originalFileUrl,
                        displayOrder: item.displayOrder || 0
                    }
                });

                imported++;
            }

            return NextResponse.json({
                success: true,
                message: `가져오기 완료: ${imported}건 추가, ${skipped}건 건너뜀`,
                imported,
                skipped
            });
        }

        return NextResponse.json(
            { success: false, error: '지원하지 않는 형식입니다.' },
            { status: 400 }
        );

    } catch (error) {
        console.error('Import error:', error);
        return NextResponse.json(
            { success: false, error: '가져오기 중 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}
