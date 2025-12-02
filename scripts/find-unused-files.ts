import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * 이 스크립트는 wp-content/uploads에서 실제로 사용되지 않는 파일을 찾습니다.
 * 
 * 실행 방법:
 * npx tsx scripts/find-unused-files.ts
 * 
 * 옵션:
 * --delete : 실제로 파일 삭제 (기본값: false, 목록만 출력)
 */

async function findUnusedFiles() {
    const uploadsDir = path.join(process.cwd(), 'public/wp-content/uploads');
    const shouldDelete = process.argv.includes('--delete');

    if (!fs.existsSync(uploadsDir)) {
        console.error('업로드 디렉토리가 존재하지 않습니다:', uploadsDir);
        return;
    }

    console.log('데이터베이스에서 사용 중인 파일 목록 가져오는 중...');

    // 1. Attachment 테이블 조회
    const attachments = await prisma.attachment.findMany({
        select: { fileUrl: true },
    });

    // 2. Post 본문 내 이미지 조회
    const posts = await prisma.post.findMany({
        select: { content: true },
        where: {
            content: { contains: 'wp-content/uploads' }
        }
    });

    // 3. Resolution 테이블 조회
    const resolutions = await prisma.resolution.findMany({
        select: { fileUrl: true },
    });

    // 사용 중인 파일 경로 Set 생성
    const usedFiles = new Set<string>();

    // Helper: URL을 로컬 경로로 변환 및 등록
    const addUrlToSet = (url: string) => {
        if (!url) return;

        try {
            // URL 디코딩 (한글 파일명 등 처리)
            const decodedUrl = decodeURIComponent(url);

            let filePath = decodedUrl;
            // URL에서 쿼리 스트링 제거
            filePath = filePath.split('?')[0];

            // 절대 경로/상대 경로 통일
            if (filePath.includes('/wp-content/uploads/')) {
                const relativePath = filePath.split('/wp-content/uploads/')[1];
                const fullPath = path.join(process.cwd(), 'public/wp-content/uploads', relativePath);
                usedFiles.add(path.normalize(fullPath));
            }
        } catch (e) {
            console.error('URL 처리 중 오류:', url, e);
        }
    };

    // Attachment 처리
    attachments.forEach(att => addUrlToSet(att.fileUrl));

    // Resolution 처리
    resolutions.forEach(res => addUrlToSet(res.fileUrl));

    // Post 본문 처리 (정규식으로 이미지 URL 추출)
    const imgRegex = /src=["']([^"']+)["']/g;
    posts.forEach(post => {
        if (!post.content) return;
        let match;
        while ((match = imgRegex.exec(post.content)) !== null) {
            addUrlToSet(match[1]);
        }
    });

    console.log(`데이터베이스에 등록된 파일: ${usedFiles.size}개`);
    console.log('업로드 폴더 스캔 중...');

    // 재귀적으로 모든 파일 찾기
    const allFiles: string[] = [];

    function scanDirectory(dir: string) {
        const entries = fs.readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);

            if (entry.isDirectory()) {
                scanDirectory(fullPath);
            } else if (entry.isFile()) {
                allFiles.push(fullPath);
            }
        }
    }

    scanDirectory(uploadsDir);
    console.log(`총 파일 수: ${allFiles.length}개`);

    // 사용하지 않는 파일 찾기
    const unusedFiles: { path: string; size: number }[] = [];
    let totalSize = 0;

    for (const filePath of allFiles) {
        const normalizedPath = path.normalize(filePath);

        if (!usedFiles.has(normalizedPath)) {
            const stats = fs.statSync(filePath);
            unusedFiles.push({
                path: filePath,
                size: stats.size,
            });
            totalSize += stats.size;
        }
    }

    console.log('\n=== 결과 ===');
    console.log(`사용하지 않는 파일: ${unusedFiles.length}개`);
    console.log(`총 용량: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);

    if (unusedFiles.length > 0) {
        console.log('\n사용하지 않는 파일 목록:');

        // 크기 순으로 정렬
        unusedFiles.sort((a, b) => b.size - a.size);

        // 상위 50개만 출력
        const displayCount = Math.min(50, unusedFiles.length);
        for (let i = 0; i < displayCount; i++) {
            const file = unusedFiles[i];
            const relativePath = path.relative(process.cwd(), file.path);
            const sizeKB = (file.size / 1024).toFixed(2);
            console.log(`  ${sizeKB} KB - ${relativePath}`);
        }

        if (unusedFiles.length > 50) {
            console.log(`  ... 외 ${unusedFiles.length - 50}개 파일`);
        }

        // 삭제 옵션
        if (shouldDelete) {
            console.log('\n파일 삭제 중...');
            let deletedCount = 0;
            let deletedSize = 0;

            for (const file of unusedFiles) {
                try {
                    fs.unlinkSync(file.path);
                    deletedCount++;
                    deletedSize += file.size;
                } catch (error) {
                    console.error(`삭제 실패: ${file.path}`, error);
                }
            }

            console.log(`\n삭제 완료: ${deletedCount}개 파일, ${(deletedSize / 1024 / 1024).toFixed(2)} MB`);

            // 빈 디렉토리 삭제
            console.log('\n빈 디렉토리 정리 중...');
            cleanEmptyDirectories(uploadsDir);
        } else {
            console.log('\n실제로 삭제하려면 --delete 옵션을 추가하세요:');
            console.log('npx tsx scripts/find-unused-files.ts --delete');
        }
    }

    await prisma.$disconnect();
}

function cleanEmptyDirectories(dir: string) {
    if (!fs.existsSync(dir)) return;

    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        if (entry.isDirectory()) {
            const fullPath = path.join(dir, entry.name);
            cleanEmptyDirectories(fullPath);
        }
    }

    // 디렉토리가 비어있는지 확인
    const remaining = fs.readdirSync(dir);
    if (remaining.length === 0 && dir !== path.join(process.cwd(), 'public/wp-content/uploads')) {
        console.log(`빈 디렉토리 삭제: ${path.relative(process.cwd(), dir)}`);
        fs.rmdirSync(dir);
    }
}

findUnusedFiles().catch(console.error);
