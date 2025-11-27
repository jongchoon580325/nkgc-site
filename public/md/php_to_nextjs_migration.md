# PHP 게시판에서 Next.js로 데이터 마이그레이션 가이드

## 목차

1. [개요](#개요)
2. [마이그레이션 전략](#마이그레이션-전략)
3. [환경 구성](#환경-구성)
4. [데이터베이스 분석 및 백업](#데이터베이스-분석-및-백업)
5. [Next.js 프로젝트 설정](#nextjs-프로젝트-설정)
6. [데이터 마이그레이션 실행](#데이터-마이그레이션-실행)
7. [API 라우트 구축](#api-라우트-구축)
8. [게시판 기능 구현](#게시판-기능-구현)
9. [파일 업로드 마이그레이션](#파일-업로드-마이그레이션)
10. [테스트 및 검증](#테스트-및-검증)
11. [트러블슈팅](#트러블슈팅)

---

## 개요

### 마이그레이션 목표

기존 PHP 8 + MySQL 기반 한국형 게시판의 데이터와 기능을 Next.js 환경으로 완전히 이전합니다.

### 주요 작업

- MySQL 데이터베이스 구조 분석 및 백업
- 게시글, 댓글, 첨부파일 데이터 이전
- 사용자 정보 및 권한 시스템 재구축
- RESTful API 설계 및 구현
- 게시판 UI/UX 재구현

---

## 마이그레이션 전략

### 1. 병렬 운영 방식 (권장)

```
[기존 PHP 사이트] ← 계속 운영
        ↓ (데이터 복사)
[새 Next.js 사이트] ← 개발 및 테스트
```

**장점**: 안전하며, 기존 서비스 중단 없음
**단점**: 초기 데이터 이후 추가 동기화 필요

### 2. 일괄 전환 방식

```
[기존 PHP 사이트] → [마이그레이션] → [Next.js 사이트]
```

**장점**: 단순하고 명확함
**단점**: 다운타임 발생 가능

### 권장 절차

1. 개발 환경에서 완전히 구축
2. 스테이징 환경에서 테스트
3. 최종 데이터 마이그레이션 후 전환

---

## 환경 구성

### 필요한 도구 설치

```bash
# Node.js 설치 확인 (v18 이상 권장)
node --version
npm --version

# MySQL 클라이언트 도구
# Windows: MySQL Workbench 또는 HeidiSQL
# Mac: Sequel Pro 또는 TablePlus
# Linux: mysql-client

# Git 설치 확인
git --version
```

### 개발 환경 구성

```bash
# 작업 디렉토리 생성
mkdir presbytery-migration
cd presbytery-migration

# 프로젝트 구조
mkdir -p {migration-scripts,backup,new-nextjs-site}
```

---

## 데이터베이스 분석 및 백업

### 1. 기존 DB 접속 정보 확인

기존 PHP 사이트의 DB 설정 파일을 찾습니다:

```php
// 일반적인 위치: config.php, db_config.php, common.php
define('DB_HOST', 'localhost');
define('DB_USER', 'username');
define('DB_PASS', 'password');
define('DB_NAME', 'database_name');
```

### 2. 데이터베이스 구조 분석

MySQL에 접속하여 테이블 구조를 확인합니다:

```sql
-- DB 접속
mysql -u username -p database_name

-- 모든 테이블 목록 확인
SHOW TABLES;

-- 각 테이블 구조 확인
DESCRIBE table_name;

-- 주요 게시판 테이블 예시
SHOW CREATE TABLE board_posts;
SHOW CREATE TABLE board_comments;
SHOW CREATE TABLE board_files;
SHOW CREATE TABLE members;
```

### 3. 전체 데이터베이스 백업

```bash
# 전체 백업 (구조 + 데이터)
mysqldump -u username -p database_name > backup/full_backup_$(date +%Y%m%d).sql

# 특정 테이블만 백업
mysqldump -u username -p database_name board_posts board_comments > backup/board_backup.sql

# 구조만 백업
mysqldump -u username -p --no-data database_name > backup/structure_only.sql
```

### 4. 데이터 분석 스크립트 작성

`migration-scripts/analyze_db.js` 파일 생성:

```javascript
const mysql = require('mysql2/promise');
const fs = require('fs').promises;

async function analyzeDatabase() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'your_username',
    password: 'your_password',
    database: 'your_database'
  });

  try {
    // 모든 테이블 조회
    const [tables] = await connection.query('SHOW TABLES');
    console.log('📊 발견된 테이블:', tables.length);

    const analysis = {};

    for (const tableRow of tables) {
      const tableName = Object.values(tableRow)[0];
      
      // 테이블 구조
      const [structure] = await connection.query(`DESCRIBE ${tableName}`);
      
      // 레코드 수
      const [count] = await connection.query(`SELECT COUNT(*) as cnt FROM ${tableName}`);
      
      // 샘플 데이터 (첫 3개)
      const [sample] = await connection.query(`SELECT * FROM ${tableName} LIMIT 3`);

      analysis[tableName] = {
        structure,
        recordCount: count[0].cnt,
        sample
      };

      console.log(`✅ ${tableName}: ${count[0].cnt} records`);
    }

    // 분석 결과 저장
    await fs.writeFile(
      'backup/db_analysis.json',
      JSON.stringify(analysis, null, 2)
    );

    console.log('\n📁 분석 완료! backup/db_analysis.json 파일을 확인하세요.');

  } finally {
    await connection.end();
  }
}

analyzeDatabase().catch(console.error);
```

실행:

```bash
npm install mysql2
node migration-scripts/analyze_db.js
```

---

## Next.js 프로젝트 설정

### 1. 프로젝트 생성

```bash
cd new-nextjs-site

# Next.js 프로젝트 생성 (TypeScript 권장)
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir

# 또는 JavaScript 버전
npx create-next-app@latest . --tailwind --app --no-src-dir
```

프롬프트 응답:

```
✔ Would you like to use TypeScript? Yes
✔ Would you like to use ESLint? Yes
✔ Would you like to use Tailwind CSS? Yes
✔ Would you like to use `app/` directory? Yes
✔ Would you like to customize the default import alias? No
```

### 2. 필요한 패키지 설치

```bash
# 데이터베이스 관련
npm install mysql2 prisma @prisma/client

# 인증 (선택)
npm install next-auth bcrypt
npm install -D @types/bcrypt

# 파일 업로드
npm install formidable
npm install -D @types/formidable

# 유틸리티
npm install dayjs lodash
npm install -D @types/lodash

# 개발 도구
npm install -D prisma
```

### 3. Prisma 초기화

```bash
npx prisma init
```

`.env` 파일이 생성되며, 데이터베이스 연결 정보를 설정합니다:

```env
# .env
DATABASE_URL="mysql://username:password@localhost:3306/database_name"

# Next.js 환경변수
NEXT_PUBLIC_API_URL=http://localhost:3000
UPLOAD_DIR=./public/uploads

# 보안 키 (production에서는 반드시 변경)
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
```

### 4. Prisma 스키마 작성

`prisma/schema.prisma` 파일을 편집합니다:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

// 사용자 모델
model User {
  id        Int      @id @default(autoincrement())
  username  String   @unique @db.VarChar(50)
  email     String   @unique @db.VarChar(100)
  password  String   @db.VarChar(255)
  name      String   @db.VarChar(50)
  role      String   @default("user") @db.VarChar(20)
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  posts    Post[]
  comments Comment[]

  @@map("users")
}

// 게시글 모델
model Post {
  id         Int      @id @default(autoincrement())
  boardId    String   @map("board_id") @db.VarChar(50)
  title      String   @db.VarChar(200)
  content    String   @db.Text
  authorId   Int      @map("author_id")
  author     User     @relation(fields: [authorId], references: [id])
  views      Int      @default(0)
  isNotice   Boolean  @default(false) @map("is_notice")
  isSecret   Boolean  @default(false) @map("is_secret")
  password   String?  @db.VarChar(255) // 비회원 게시글용
  createdAt  DateTime @default(now()) @map("created_at")
  updatedAt  DateTime @updatedAt @map("updated_at")

  comments Comment[]
  files    File[]

  @@index([boardId, createdAt])
  @@map("posts")
}

// 댓글 모델
model Comment {
  id        Int      @id @default(autoincrement())
  postId    Int      @map("post_id")
  post      Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  authorId  Int?     @map("author_id")
  author    User?    @relation(fields: [authorId], references: [id])
  content   String   @db.Text
  parentId  Int?     @map("parent_id") // 대댓글용
  isSecret  Boolean  @default(false) @map("is_secret")
  createdAt DateTime @default(now()) @map("created_at")

  @@index([postId])
  @@map("comments")
}

// 첨부파일 모델
model File {
  id           Int      @id @default(autoincrement())
  postId       Int      @map("post_id")
  post         Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  originalName String   @map("original_name") @db.VarChar(255)
  savedName    String   @map("saved_name") @db.VarChar(255)
  filePath     String   @map("file_path") @db.VarChar(500)
  fileSize     Int      @map("file_size")
  mimeType     String   @map("mime_type") @db.VarChar(100)
  downloadCount Int     @default(0) @map("download_count")
  createdAt    DateTime @default(now()) @map("created_at")

  @@index([postId])
  @@map("files")
}
```

### 5. 기존 DB를 Prisma로 가져오기 (introspect)

기존 MySQL 데이터베이스 구조를 자동으로 가져옵니다:

```bash
# 기존 DB 구조를 Prisma 스키마로 변환
npx prisma db pull

# Prisma Client 생성
npx prisma generate
```

---

## 데이터 마이그레이션 실행

### 1. 마이그레이션 스크립트 작성

`migration-scripts/migrate_data.js` 생성:

```javascript
const mysql = require('mysql2/promise');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const fs = require('fs').promises;
const path = require('path');

const prisma = new PrismaClient();

// 기존 PHP DB 연결
const oldDbConfig = {
  host: 'localhost',
  user: 'old_username',
  password: 'old_password',
  database: 'old_database'
};

async function migrateUsers() {
  console.log('👤 사용자 마이그레이션 시작...');
  
  const oldConnection = await mysql.createConnection(oldDbConfig);
  
  try {
    // 기존 DB의 사용자 조회 (테이블명은 실제와 맞춰주세요)
    const [oldUsers] = await oldConnection.query(`
      SELECT 
        mb_no as id,
        mb_id as username,
        mb_email as email,
        mb_password as password,
        mb_name as name,
        mb_level as level,
        mb_datetime as created_at
      FROM g5_member
      ORDER BY mb_no
    `);

    console.log(`📊 발견된 사용자: ${oldUsers.length}명`);

    for (const oldUser of oldUsers) {
      try {
        // 비밀번호는 bcrypt로 재해싱 (PHP의 해시와 호환되지 않을 수 있음)
        // 사용자에게 비밀번호 재설정을 요청하는 것도 고려
        const hashedPassword = await bcrypt.hash(oldUser.password, 10);

        await prisma.user.create({
          data: {
            username: oldUser.username,
            email: oldUser.email || `${oldUser.username}@temp.com`,
            password: hashedPassword,
            name: oldUser.name,
            role: oldUser.level >= 8 ? 'admin' : 'user',
            createdAt: new Date(oldUser.created_at)
          }
        });

        console.log(`  ✓ ${oldUser.username}`);
      } catch (error) {
        console.error(`  ✗ ${oldUser.username} 실패:`, error.message);
      }
    }

    console.log('✅ 사용자 마이그레이션 완료\n');
  } finally {
    await oldConnection.end();
  }
}

async function migratePosts() {
  console.log('📝 게시글 마이그레이션 시작...');
  
  const oldConnection = await mysql.createConnection(oldDbConfig);
  
  try {
    // 기존 게시글 조회 (테이블명과 컬럼명은 실제 구조에 맞춰주세요)
    const [oldPosts] = await oldConnection.query(`
      SELECT 
        wr_id as id,
        bo_table as board_id,
        wr_subject as title,
        wr_content as content,
        mb_id as author_username,
        wr_hit as views,
        wr_datetime as created_at
      FROM g5_write_notice
      ORDER BY wr_id
    `);

    console.log(`📊 발견된 게시글: ${oldPosts.length}개`);

    for (const oldPost of oldPosts) {
      try {
        // 작성자 찾기
        const author = await prisma.user.findUnique({
          where: { username: oldPost.author_username }
        });

        if (!author) {
          console.log(`  ⚠ 작성자를 찾을 수 없음: ${oldPost.author_username}`);
          continue;
        }

        // HTML 태그 정리 (선택사항)
        const cleanContent = oldPost.content
          .replace(/<br\s*\/?>/gi, '\n')
          .replace(/<[^>]+>/g, '');

        await prisma.post.create({
          data: {
            boardId: oldPost.board_id,
            title: oldPost.title,
            content: cleanContent,
            authorId: author.id,
            views: oldPost.views || 0,
            createdAt: new Date(oldPost.created_at)
          }
        });

        console.log(`  ✓ ${oldPost.title}`);
      } catch (error) {
        console.error(`  ✗ 게시글 ${oldPost.id} 실패:`, error.message);
      }
    }

    console.log('✅ 게시글 마이그레이션 완료\n');
  } finally {
    await oldConnection.end();
  }
}

async function migrateComments() {
  console.log('💬 댓글 마이그레이션 시작...');
  
  const oldConnection = await mysql.createConnection(oldDbConfig);
  
  try {
    const [oldComments] = await oldConnection.query(`
      SELECT 
        wr_id as id,
        wr_parent as post_id,
        wr_content as content,
        mb_id as author_username,
        wr_datetime as created_at
      FROM g5_write_comment
      ORDER BY wr_id
    `);

    console.log(`📊 발견된 댓글: ${oldComments.length}개`);

    for (const oldComment of oldComments) {
      try {
        const author = await prisma.user.findUnique({
          where: { username: oldComment.author_username }
        });

        // 원본 게시글 찾기 (post_id 매핑이 필요할 수 있음)
        const post = await prisma.post.findFirst({
          where: { id: oldComment.post_id }
        });

        if (!post) continue;

        await prisma.comment.create({
          data: {
            postId: post.id,
            authorId: author?.id,
            content: oldComment.content,
            createdAt: new Date(oldComment.created_at)
          }
        });

        console.log(`  ✓ 댓글 ${oldComment.id}`);
      } catch (error) {
        console.error(`  ✗ 댓글 ${oldComment.id} 실패:`, error.message);
      }
    }

    console.log('✅ 댓글 마이그레이션 완료\n');
  } finally {
    await oldConnection.end();
  }
}

async function migrateFiles() {
  console.log('📎 첨부파일 마이그레이션 시작...');
  
  const oldConnection = await mysql.createConnection(oldDbConfig);
  
  try {
    const [oldFiles] = await oldConnection.query(`
      SELECT 
        bf_no as id,
        wr_id as post_id,
        bf_source as original_name,
        bf_file as saved_name,
        bf_filesize as file_size,
        bf_download as download_count
      FROM g5_board_file
      WHERE bf_file != ''
      ORDER BY bf_no
    `);

    console.log(`📊 발견된 파일: ${oldFiles.length}개`);

    const uploadDir = path.join(__dirname, '../new-nextjs-site/public/uploads');
    await fs.mkdir(uploadDir, { recursive: true });

    for (const oldFile of oldFiles) {
      try {
        // 게시글 찾기
        const post = await prisma.post.findFirst({
          where: { id: oldFile.post_id }
        });

        if (!post) continue;

        // 파일 복사 (기존 파일 경로는 실제 환경에 맞춰주세요)
        const oldFilePath = `/var/www/html/data/file/${oldFile.saved_name}`;
        const newFilePath = path.join(uploadDir, oldFile.saved_name);

        try {
          await fs.copyFile(oldFilePath, newFilePath);
        } catch (fileError) {
          console.log(`  ⚠ 파일 복사 실패: ${oldFile.original_name}`);
        }

        await prisma.file.create({
          data: {
            postId: post.id,
            originalName: oldFile.original_name,
            savedName: oldFile.saved_name,
            filePath: `/uploads/${oldFile.saved_name}`,
            fileSize: oldFile.file_size,
            mimeType: 'application/octet-stream',
            downloadCount: oldFile.download_count || 0
          }
        });

        console.log(`  ✓ ${oldFile.original_name}`);
      } catch (error) {
        console.error(`  ✗ 파일 ${oldFile.id} 실패:`, error.message);
      }
    }

    console.log('✅ 첨부파일 마이그레이션 완료\n');
  } finally {
    await oldConnection.end();
  }
}

async function main() {
  console.log('🚀 데이터 마이그레이션 시작\n');
  console.log('=' .repeat(50));
  
  try {
    await migrateUsers();
    await migratePosts();
    await migrateComments();
    await migrateFiles();
    
    console.log('=' .repeat(50));
    console.log('✅ 모든 마이그레이션 완료!');
    
    // 통계 출력
    const stats = {
      users: await prisma.user.count(),
      posts: await prisma.post.count(),
      comments: await prisma.comment.count(),
      files: await prisma.file.count()
    };
    
    console.log('\n📊 마이그레이션 결과:');
    console.log(`  - 사용자: ${stats.users}명`);
    console.log(`  - 게시글: ${stats.posts}개`);
    console.log(`  - 댓글: ${stats.comments}개`);
    console.log(`  - 파일: ${stats.files}개`);
    
  } catch (error) {
    console.error('❌ 마이그레이션 실패:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
```

### 2. 마이그레이션 실행

```bash
# 스크립트 실행
node migration-scripts/migrate_data.js

# 로그를 파일로 저장하려면
node migration-scripts/migrate_data.js > migration.log 2>&1
```

### 3. 마이그레이션 검증

```bash
# Prisma Studio로 데이터 확인
npx prisma studio
```

브라우저에서 `http://localhost:5555`로 접속하여 데이터를 확인합니다.

---

## API 라우트 구축

### 1. Prisma Client 설정

`lib/prisma.ts` 파일 생성:

```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query', 'error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

### 2. 게시글 목록 API

`app/api/posts/route.ts` 생성:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const boardId = searchParams.get('boardId') || 'notice';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // 게시글 조회
    const posts = await prisma.post.findMany({
      where: { boardId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true
          }
        },
        _count: {
          select: {
            comments: true,
            files: true
          }
        }
      },
      orderBy: [
        { isNotice: 'desc' },
        { createdAt: 'desc' }
      ],
      skip,
      take: limit
    });

    // 전체 개수
    const total = await prisma.post.count({
      where: { boardId }
    });

    return NextResponse.json({
      success: true,
      data: {
        posts,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('게시글 조회 오류:', error);
    return NextResponse.json(
      { success: false, error: '게시글을 불러올 수 없습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { boardId, title, content, authorId, isNotice } = body;

    // 유효성 검사
    if (!title || !content || !authorId) {
      return NextResponse.json(
        { success: false, error: '필수 항목을 입력해주세요.' },
        { status: 400 }
      );
    }

    // 게시글 생성
    const post = await prisma.post.create({
      data: {
        boardId: boardId || 'notice',
        title,
        content,
        authorId,
        isNotice: isNotice || false
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: post
    }, { status: 201 });
  } catch (error) {
    console.error('게시글 작성 오류:', error);
    return NextResponse.json(
      { success: false, error: '게시글 작성에 실패했습니다.' },
      { status: 500 }
    );
  }
}
```

### 3. 게시글 상세 API

`app/api/posts/[id]/route.ts` 생성:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const postId = parseInt(params.id);

    // 조회수 증가
    await prisma.post.update({
      where: { id: postId },
      data: { views: { increment: 1 } }
    });

    // 게시글 조회
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true
          }
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                username: true
              }
            }
          },
          orderBy: { createdAt: 'asc' }
        },
        files: true
      }
    });

    if (!post) {
      return NextResponse.json(
        { success: false, error: '게시글을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: post
    });
  } catch (error) {
    console.error('게시글 조회 오류:', error);
    return NextResponse.json(
      { success: false, error: '게시글을 불러올 수 없습니다.' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const postId = parseInt(params.id);
    const body = await request.json();
    const { title, content } = body;

    const post = await prisma.post.update({
      where: { id: postId },
      data: {
        title,
        content,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      data: post
    });
  } catch (error) {
    console.error('게시글 수정 오류:', error);
    return NextResponse.json(
      { success: false, error: '게시글 수정에 실패했습니다.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const postId = parseInt(params.id);

    // 게시글 삭제 (Cascade로 댓글, 파일도 함께 삭제됨)
    await prisma.post.delete({
      where: { id: postId }
    });

    return NextResponse.json({
      success: true,
      message: '게시글이 삭제되었습니다.'
    });
  } catch (error) {
    console.error('게시글 삭제 오류:', error);
    return NextResponse.json(
      { success: false, error: '게시글 삭제에 실패했습니다.' },
      { status: 500 }
    );
  }
}
```

### 4. 댓글 API

`app/api/comments/route.ts` 생성:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { postId, authorId, content, parentId } = body;

    if (!postId || !content) {
      return NextResponse.json(
        { success: false, error: '필수 항목을 입력해주세요.' },
        { status: 400 }
      );
    }

    const comment = await prisma.comment.create({
      data: {
        postId,
        authorId,
        content,
        parentId: parentId || null
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: comment
    }, { status: 201 });
  } catch (error) {
    console.error('댓글 작성 오류:', error);
    return NextResponse.json(
      { success: false, error: '댓글 작성에 실패했습니다.' },
      { status: 500 }
    );
  }
}
```

---

## 파일 업로드 마이그레이션

### 1. 파일 업로드 API

`app/api/upload/route.ts` 생성:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const postId = formData.get('postId') as string;

    if (!file) {
      return NextResponse.json(
        { success: false, error: '파일이 없습니다.' },
        { status: 400 }
      );
    }

    // 파일 크기 제한 (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: '파일 크기는 10MB를 초과할 수 없습니다.' },
        { status: 400 }
      );
    }

    // 허용된 파일 형식
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: '지원하지 않는 파일 형식입니다.' },
        { status: 400 }
      );
    }

    // 업로드 디렉토리 생성
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });

    // 파일명 생성 (UUID + 원본 확장자)
    const ext = path.extname(file.name);
    const savedName = `${uuidv4()}${ext}`;
    const filePath = path.join(uploadDir, savedName);

    // 파일 저장
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // DB에 파일 정보 저장
    const fileRecord = await prisma.file.create({
      data: {
        postId: parseInt(postId),
        originalName: file.name,
        savedName,
        filePath: `/uploads/${savedName}`,
        fileSize: file.size,
        mimeType: file.type
      }
    });

    return NextResponse.json({
      success: true,
      data: fileRecord
    }, { status: 201 });
  } catch (error) {
    console.error('파일 업로드 오류:', error);
    return NextResponse.json(
      { success: false, error: '파일 업로드에 실패했습니다.' },
      { status: 500 }
    );
  }
}
```

### 2. 파일 다운로드 API

`app/api/files/[id]/download/route.ts` 생성:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { readFile } from 'fs/promises';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const fileId = parseInt(params.id);

    // 파일 정보 조회
    const file = await prisma.file.findUnique({
      where: { id: fileId }
    });

    if (!file) {
      return NextResponse.json(
        { success: false, error: '파일을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 다운로드 횟수 증가
    await prisma.file.update({
      where: { id: fileId },
      data: { downloadCount: { increment: 1 } }
    });

    // 파일 읽기
    const filePath = path.join(process.cwd(), 'public', file.filePath);
    const fileBuffer = await readFile(filePath);

    // 파일 다운로드 응답
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': file.mimeType,
        'Content-Disposition': `attachment; filename="${encodeURIComponent(file.originalName)}"`,
        'Content-Length': file.fileSize.toString()
      }
    });
  } catch (error) {
    console.error('파일 다운로드 오류:', error);
    return NextResponse.json(
      { success: false, error: '파일 다운로드에 실패했습니다.' },
      { status: 500 }
    );
  }
}
```

---

## 게시판 기능 구현

### 1. 게시판 목록 페이지

`app/board/[boardId]/page.tsx` 생성:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Post {
  id: number;
  title: string;
  author: {
    name: string;
  };
  views: number;
  createdAt: string;
  _count: {
    comments: number;
    files: number;
  };
  isNotice: boolean;
}

export default function BoardListPage() {
  const params = useParams();
  const router = useRouter();
  const boardId = params.boardId as string;

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchPosts();
  }, [page, boardId]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/posts?boardId=${boardId}&page=${page}&limit=15`
      );
      const result = await response.json();

      if (result.success) {
        setPosts(result.data.posts);
        setTotalPages(result.data.pagination.totalPages);
      }
    } catch (error) {
      console.error('게시글 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue"></div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <div className="bg-white rounded-lg shadow-md">
        {/* 헤더 */}
        <div className="border-b border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {boardId === 'notice' ? '공지사항' : '게시판'}
          </h1>
        </div>

        {/* 게시글 목록 */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  번호
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  제목
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  작성자
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  작성일
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  조회
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {posts.map((post, index) => (
                <tr
                  key={post.id}
                  className={`hover:bg-gray-50 cursor-pointer ${
                    post.isNotice ? 'bg-yellow-50' : ''
                  }`}
                  onClick={() => router.push(`/board/${boardId}/${post.id}`)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {post.isNotice ? (
                      <span className="text-red-600 font-bold">공지</span>
                    ) : (
                      index + 1
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="flex items-center">
                      {post.title}
                      {post._count.comments > 0 && (
                        <span className="ml-2 text-primary-blue">
                          [{post._count.comments}]
                        </span>
                      )}
                      {post._count.files > 0 && (
                        <span className="ml-2 text-gray-400">📎</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {post.author.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(post.createdAt).toLocaleDateString('ko-KR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {post.views}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 페이지네이션 */}
        <div className="flex justify-center items-center gap-2 p-6 border-t border-gray-200">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50"
          >
            이전
          </button>
          <span className="px-4 py-2">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50"
          >
            다음
          </button>
        </div>

        {/* 글쓰기 버튼 */}
        <div className="p-6 border-t border-gray-200">
          <Link
            href={`/board/${boardId}/write`}
            className="px-6 py-2 bg-primary-blue text-white rounded-md hover:bg-brand-700 transition-colors"
          >
            글쓰기
          </Link>
        </div>
      </div>
    </div>
  );
}
```

### 2. 게시글 상세 페이지

`app/board/[boardId]/[postId]/page.tsx` 생성:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Post {
  id: number;
  title: string;
  content: string;
  author: {
    id: number;
    name: string;
  };
  views: number;
  createdAt: string;
  comments: Comment[];
  files: File[];
}

interface Comment {
  id: number;
  content: string;
  author: {
    name: string;
  };
  createdAt: string;
}

interface File {
  id: number;
  originalName: string;
  fileSize: number;
  downloadCount: number;
}

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const boardId = params.boardId as string;
  const postId = params.postId as string;

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentContent, setCommentContent] = useState('');

  useEffect(() => {
    fetchPost();
  }, [postId]);

  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/posts/${postId}`);
      const result = await response.json();

      if (result.success) {
        setPost(result.data);
      }
    } catch (error) {
      console.error('게시글 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!commentContent.trim()) {
      alert('댓글 내용을 입력해주세요.');
      return;
    }

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: parseInt(postId),
          authorId: 1, // 실제로는 로그인한 사용자 ID
          content: commentContent
        })
      });

      const result = await response.json();

      if (result.success) {
        setCommentContent('');
        fetchPost(); // 댓글 목록 새로고침
      }
    } catch (error) {
      console.error('댓글 작성 실패:', error);
    }
  };

  const handleFileDownload = async (fileId: number) => {
    window.open(`/api/files/${fileId}/download`, '_blank');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container-custom py-8">
        <div className="text-center">
          <p className="text-gray-600">게시글을 찾을 수 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <div className="bg-white rounded-lg shadow-md">
        {/* 게시글 헤더 */}
        <div className="border-b border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {post.title}
          </h1>
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-4">
              <span>작성자: {post.author.name}</span>
              <span>
                작성일: {new Date(post.createdAt).toLocaleDateString('ko-KR')}
              </span>
              <span>조회: {post.views}</span>
            </div>
          </div>
        </div>

        {/* 첨부파일 */}
        {post.files.length > 0 && (
          <div className="border-b border-gray-200 p-6 bg-gray-50">
            <h3 className="font-semibold mb-2">첨부파일</h3>
            <div className="space-y-2">
              {post.files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-2 bg-white rounded border border-gray-200"
                >
                  <button
                    onClick={() => handleFileDownload(file.id)}
                    className="text-primary-blue hover:underline"
                  >
                    📎 {file.originalName}
                  </button>
                  <span className="text-sm text-gray-500">
                    {(file.fileSize / 1024).toFixed(1)}KB (다운로드:{' '}
                    {file.downloadCount})
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 게시글 내용 */}
        <div className="p-6 min-h-[300px]">
          <div className="prose max-w-none">
            {post.content.split('\n').map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </div>
        </div>

        {/* 댓글 */}
        <div className="border-t border-gray-200 p-6">
          <h3 className="font-semibold mb-4">
            댓글 ({post.comments.length})
          </h3>

          {/* 댓글 목록 */}
          <div className="space-y-4 mb-6">
            {post.comments.map((comment) => (
              <div
                key={comment.id}
                className="p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{comment.author.name}</span>
                  <span className="text-sm text-gray-500">
                    {new Date(comment.createdAt).toLocaleDateString('ko-KR')}
                  </span>
                </div>
                <p className="text-gray-700">{comment.content}</p>
              </div>
            ))}
          </div>

          {/* 댓글 작성 */}
          <form onSubmit={handleCommentSubmit} className="space-y-4">
            <textarea
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              placeholder="댓글을 입력하세요"
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
              rows={4}
            />
            <button
              type="submit"
              className="px-6 py-2 bg-primary-blue text-white rounded-md hover:bg-brand-700 transition-colors"
            >
              댓글 작성
            </button>
          </form>
        </div>

        {/* 하단 버튼 */}
        <div className="border-t border-gray-200 p-6 flex gap-2">
          <button
            onClick={() => router.push(`/board/${boardId}`)}
            className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            목록
          </button>
          <button
            onClick={() => router.push(`/board/${boardId}/${postId}/edit`)}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
          >
            수정
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## 테스트 및 검증

### 1. 데이터 무결성 검증

```bash
# Prisma Studio로 데이터 확인
npx prisma studio
```

검증 항목:

- ✅ 모든 사용자가 올바르게 마이그레이션되었는가?
- ✅ 게시글의 작성자 관계가 정확한가?
- ✅ 댓글이 올바른 게시글에 연결되었는가?
- ✅ 첨부파일이 정상적으로 다운로드되는가?

### 2. 기능 테스트 체크리스트

```markdown
## 게시판 기능 테스트

- [ ] 게시글 목록 조회
- [ ] 게시글 상세 조회
- [ ] 게시글 작성
- [ ] 게시글 수정
- [ ] 게시글 삭제
- [ ] 댓글 작성
- [ ] 댓글 삭제
- [ ] 파일 업로드
- [ ] 파일 다운로드
- [ ] 페이지네이션
- [ ] 검색 기능
- [ ] 조회수 증가
- [ ] 공지사항 고정
```

### 3. 성능 테스트

```javascript
// scripts/performance_test.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function performanceTest() {
  console.time('게시글 1000개 조회');
  
  const posts = await prisma.post.findMany({
    take: 1000,
    include: {
      author: true,
      _count: {
        select: {
          comments: true,
          files: true
        }
      }
    }
  });
  
  console.timeEnd('게시글 1000개 조회');
  console.log(`조회된 게시글: ${posts.length}개`);
}

performanceTest()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

---

## 트러블슈팅

### 1. 비밀번호 호환성 문제

**문제**: PHP의 `password_hash()`와 Node.js의 `bcrypt`가 호환되지 않음

**해결방법**:

```javascript
// 옵션 1: 사용자에게 비밀번호 재설정 요청
await prisma.user.update({
  where: { id: userId },
  data: {
    password: null, // 또는 임시 비밀번호
    passwordResetRequired: true
  }
});

// 옵션 2: PHP 해시를 그대로 저장하고 첫 로그인 시 재해싱
// (복잡하므로 권장하지 않음)
```

### 2. 한글 인코딩 문제

**문제**: 마이그레이션 후 한글이 깨짐

**해결방법**:

```javascript
// MySQL 연결 시 charset 설정
const connection = await mysql.createConnection({
  host: 'localhost',
  user: 'username',
  password: 'password',
  database: 'database_name',
  charset: 'utf8mb4' // 추가
});

// Prisma schema.prisma에서도 설정
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
  // DATABASE_URL에 ?charset=utf8mb4 추가
}
```

### 3. 대용량 파일 마이그레이션

**문제**: 수천 개의 파일을 한 번에 복사하면 메모리 부족

**해결방법**:

```javascript
// 배치 처리로 나눠서 복사
async function migrateFilesInBatches() {
  const batchSize = 100;
  let offset = 0;
  
  while (true) {
    const files = await oldConnection.query(`
      SELECT * FROM g5_board_file 
      LIMIT ${batchSize} OFFSET ${offset}
    `);
    
    if (files[0].length === 0) break;
    
    for (const file of files[0]) {
      // 파일 복사 로직
    }
    
    offset += batchSize;
    console.log(`진행률: ${offset}개 처리 완료`);
  }
}
```

### 4. 게시글 ID 불일치

**문제**: 기존 PHP 게시판의 ID와 새 DB의 ID가 달라짐

**해결방법**:

```javascript
// ID 매핑 테이블 생성
const idMapping = new Map();

for (const oldPost of oldPosts) {
  const newPost = await prisma.post.create({
    data: { /* ... */ }
  });
  
  idMapping.set(oldPost.id, newPost.id);
}

// 댓글 마이그레이션 시 매핑 사용
const newPostId = idMapping.get(oldComment.post_id);
```

### 5. 세션/쿠키 처리

**문제**: 기존 PHP 세션을 Next.js에서 사용할 수 없음

**해결방법**:

```bash
# NextAuth.js 설치 및 설정
npm install next-auth

# app/api/auth/[...nextauth]/route.ts 생성
```

```typescript
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { username: credentials.username }
        });

        if (!user) {
          return null;
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isValid) {
          return null;
        }

        return {
          id: user.id.toString(),
          name: user.name,
          email: user.email
        };
      }
    })
  ],
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt'
  }
});

export { handler as GET, handler as POST };
```

---

## 마이그레이션 완료 후 체크리스트

### 배포 전 최종 확인

- [ ] 모든 데이터가 정상적으로 마이그레이션되었는가?
- [ ] 게시판 CRUD 기능이 정상 작동하는가?
- [ ] 파일 업로드/다운로드가 정상 작동하는가?
- [ ] 사용자 인증이 정상 작동하는가?
- [ ] 모바일 반응형이 정상 작동하는가?
- [ ] SEO 메타태그가 설정되었는가?
- [ ] 에러 로깅이 설정되었는가?
- [ ] 백업 시스템이 구축되었는가?
- [ ] SSL 인증서가 설정되었는가?
- [ ] 성능 최적화가 완료되었는가?

### 배포 후 모니터링

```javascript
// 에러 로깅 설정 (예: Sentry)
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
});

// API 응답 시간 모니터링
console.time('API Response Time');
// ... API 로직
console.timeEnd('API Response Time');
```

---

## 추가 개선 사항

### 1. 검색 기능 추가

```typescript
// app/api/posts/search/route.ts
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const keyword = searchParams.get('keyword') || '';

  const posts = await prisma.post.findMany({
    where: {
      OR: [
        { title: { contains: keyword } },
        { content: { contains: keyword } }
      ]
    },
    include: {
      author: {
        select: { name: true }
      }
    }
  });

  return NextResponse.json({ success: true, data: posts });
}
```

### 2. 에디터 통합 (Quill 또는 TinyMCE)

```bash
npm install react-quill
```

```typescript
'use client';

import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

export default function PostEditor() {
  const [content, setContent] = useState('');

  return (
    <ReactQuill
      theme="snow"
      value={content}
      onChange={setContent}
      modules={{
        toolbar: [
          ['bold', 'italic', 'underline'],
          ['link', 'image'],
          [{ list: 'ordered' }, { list: 'bullet' }]
        ]
      }}
    />
  );
}
```

### 3. 이미지 최적화

```typescript
import Image from 'next/image';

// 게시글 내 이미지 최적화
<Image
  src="/uploads/image.jpg"
  alt="게시글 이미지"
  width={800}
  height={600}
  quality={85}
  loading="lazy"
/>
```

---

## 결론

이 가이드를 따라 PHP 게시판을 Next.js로 성공적으로 마이그레이션할 수 있습니다.

**핵심 포인트**:

1. 철저한 백업과 테스트
2. 단계별 마이그레이션
3. 데이터 무결성 검증
4. 사용자 경험 개선

**다음 단계**:

- 성능 모니터링 및 최적화
- 사용자 피드백 수집
- 지속적인 기능 개선

마이그레이션 과정에서 문제가 발생하면 백업을 활용하여 롤백할 수 있도록 준비하세요.
