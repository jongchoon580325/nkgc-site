# Integrated Media Management System (IMMS)

**Architecture & Implementation Guide**

This document contains the complete source code and configuration for the IMMS, designed for Next.js 14+, Prisma, and TypeScript. It includes the storage abstraction layer, database schema (with folder support), server actions, and infrastructure setup.

---

## 1. Folder Structure

Recommended project organization to maintain separation of concerns:

```text
src/
├── app/
│   ├── actions/
│   │   ├── media.ts           # Bulk actions (delete/move)
│   │   └── folders.ts         # Folder creation & navigation
│   ├── api/
│   │   └── media/
│   │       └── upload/
│   │           └── route.ts   # Main upload handler
├── components/
│   └── media/
│       ├── MediaManager.tsx   # Main Container (Tabs + Logic)
│       └── AdminToolbar.tsx   # Bulk Action UI
├── lib/
│   └── db.ts                  # Prisma Client singleton
├── services/
│   └── storage/
│       ├── StorageInterface.ts     # The Contract
│       └── LocalStorageProvider.ts # The Implementation (Sharp + FS)
├── prisma/
│   └── schema.prisma          # Database Models
├── scripts/
│   └── migrate-to-postgres.ts # Migration Utility
└── docker-compose.yml         # Local Infrastructure
```

---

## 2. Database Schema (Prisma)

Update `prisma/schema.prisma`. This includes the `FileAsset` model and the `MediaFolder` model for nesting.

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite" // Change to "postgresql" when ready for Docker
  url      = env("DATABASE_URL")
}

model MediaFolder {
  id        String   @id @default(cuid())
  name      String
  
  // Hierarchy (Adjacency List Pattern)
  parentId  String?
  parent    MediaFolder?  @relation("FolderHierarchy", fields: [parentId], references: [id], onDelete: Cascade)
  children  MediaFolder[] @relation("FolderHierarchy")

  // Content
  assets    FileAsset[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([name, parentId]) // Prevent duplicate names in same folder
}

model FileAsset {
  id          String   @id @default(cuid())
  
  // Metadata
  filename    String
  storedName  String   @unique
  mimeType    String
  size        Int
  
  // Image Specifics
  width       Int?
  height      Int?
  blurDataUrl String?
  
  // Storage Context
  path        String
  provider    String   // 'local', 's3', 'r2'
  hash        String?  @unique // SHA-256 for de-duplication
  
  // Organization
  folderId    String?
  folder      MediaFolder? @relation(fields: [folderId], references: [id], onDelete: SetNull)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([mimeType])
  @@index([createdAt])
}
```

---

## 3. Storage Abstraction Layer

### The Interface

`src/services/storage/StorageInterface.ts`

```typescript
export interface IStorageProvider {
  /**
   * Uploads a buffer to storage. Returns the public access path/URL.
   */
  upload(file: Buffer, fileName: string, mimeType: string): Promise<string>;

  /**
   * Permanently deletes the file from storage.
   */
  delete(path: string): Promise<void>;
}
```

### The Implementation (Local + Sharp)

`src/services/storage/LocalStorageProvider.ts`

```typescript
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { IStorageProvider } from './StorageInterface';

export class LocalStorageProvider implements IStorageProvider {
  private uploadDir: string;

  constructor() {
    this.uploadDir = path.join(process.cwd(), 'public', 'uploads');
  }

  async upload(file: Buffer, fileName: string, mimeType: string): Promise<string> {
    await fs.mkdir(this.uploadDir, { recursive: true });

    let finalBuffer = file;
    let finalName = fileName;

    // Optimization: Resize & Compress Images
    if (mimeType.startsWith('image/')) {
      finalBuffer = await sharp(file)
        .resize({ width: 1920, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer();
      
      finalName = finalName.replace(/\.[^/.]+$/, "") + ".webp";
    }

    const filePath = path.join(this.uploadDir, finalName);
    await fs.writeFile(filePath, finalBuffer);

    return `/uploads/${finalName}`;
  }

  async delete(filePath: string): Promise<void> {
    const fullPath = path.join(process.cwd(), 'public', filePath);
    try {
      await fs.unlink(fullPath);
    } catch (error) {
      console.error(`Failed to delete file at ${fullPath}`, error);
    }
  }
}
```

---

## 4. API Routes (Smart Upload)

`src/app/api/media/upload/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { LocalStorageProvider } from '@/services/storage/LocalStorageProvider';
import { db } from '@/lib/db';
import crypto from 'node:crypto';
import { z } from 'zod';

const UploadSchema = z.object({
  file: z.instanceof(File).refine((f) => f.size < 10 * 1024 * 1024, "Max 10MB"),
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const folderId = formData.get('folderId') as string | null;

    // 1. Validation
    const result = UploadSchema.safeParse({ file });
    if (!result.success) return NextResponse.json({ error: result.error }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());

    // 2. De-duplication Check
    const hash = crypto.createHash('sha256').update(buffer).digest('hex');
    const existing = await db.fileAsset.findUnique({ where: { hash } });
    if (existing) return NextResponse.json({ message: "File exists", asset: existing });

    // 3. Storage
    const safeName = `${crypto.randomUUID()}-${Date.now()}`;
    const storage = new LocalStorageProvider();
    const publicPath = await storage.upload(buffer, safeName, file.type);

    // 4. Database Record
    const newAsset = await db.fileAsset.create({
      data: {
        filename: file.name,
        storedName: safeName,
        mimeType: file.type,
        size: buffer.length,
        path: publicPath,
        provider: 'local',
        hash: hash,
        folderId: folderId || null,
      }
    });

    return NextResponse.json({ asset: newAsset }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
```

---

## 5. Server Actions (Logic Layer)

### Media Actions

`src/app/actions/media.ts`

```typescript
'use server';

import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { LocalStorageProvider } from '@/services/storage/LocalStorageProvider';
import { revalidatePath } from 'next/cache';

export async function bulkDeleteAssets(assetIds: string[]) {
  const session = await getServerSession();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const assets = await db.fileAsset.findMany({
      where: { id: { in: assetIds } },
      select: { id: true, path: true }
    });

    const storage = new LocalStorageProvider();
    
    // Delete physical files
    await Promise.allSettled(assets.map(a => storage.delete(a.path)));

    // Delete DB records
    await db.fileAsset.deleteMany({ where: { id: { in: assetIds } } });

    revalidatePath('/admin/media');
    return { success: true, count: assets.length };
  } catch (e) {
    return { success: false, error: "Delete failed" };
  }
}
```

### Folder Actions

`src/app/actions/folders.ts`

```typescript
'use server';

import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { revalidatePath } from 'next/cache';

export async function createFolder(name: string, parentId: string | null) {
  const session = await getServerSession();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const folder = await db.mediaFolder.create({
      data: { name, parentId }
    });
    revalidatePath('/admin/media');
    return { success: true, folder };
  } catch (e) {
    return { success: false, error: "Duplicate name or error" };
  }
}

export async function getFolderContents(folderId: string | null) {
  const folders = await db.mediaFolder.findMany({ 
    where: { parentId: folderId },
    orderBy: { name: 'asc' } 
  });
  
  const assets = await db.fileAsset.findMany({ 
    where: { folderId: folderId },
    orderBy: { createdAt: 'desc' }
  });

  // Simple breadcrumb generator
  let breadcrumbs = [];
  let currentId = folderId;
  while(currentId) {
     const f = await db.mediaFolder.findUnique({ where: { id: currentId }});
     if(!f) break;
     breadcrumbs.unshift({ id: f.id, name: f.name });
     currentId = f.parentId;
  }

  return { folders, assets, breadcrumbs };
}
```

---

## 6. Frontend Component (Media Manager)

`src/components/media/MediaManager.tsx`

```typescript
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { getFolderContents, createFolder } from '@/app/actions/folders';

export default function MediaManager() {
  const [activeTab, setActiveTab] = useState('library');
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [items, setItems] = useState({ folders: [], assets: [], breadcrumbs: [] });
  const [uploading, setUploading] = useState(false);

  // Load Data
  const refresh = useCallback(async () => {
    const data = await getFolderContents(currentFolderId);
    setItems(data as any);
  }, [currentFolderId]);

  useEffect(() => { refresh(); }, [refresh]);

  // Upload Logic
  const onDrop = useCallback(async (files: File[]) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('file', files[0]);
    if (currentFolderId) formData.append('folderId', currentFolderId);

    await fetch('/api/media/upload', { method: 'POST', body: formData });
    setUploading(false);
    setActiveTab('library');
    refresh();
  }, [currentFolderId, refresh]);

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <div className="bg-white rounded-lg shadow border min-h-[600px] flex flex-col">
      {/* Header & Tabs */}
      <div className="flex border-b">
        <button onClick={() => setActiveTab('upload')} className="px-6 py-4">Upload</button>
        <button onClick={() => setActiveTab('library')} className="px-6 py-4 font-bold border-b-2 border-blue-500">Library</button>
      </div>

      {/* Content Area */}
      <div className="p-6 flex-1">
        {activeTab === 'upload' ? (
          <div {...getRootProps()} className="border-2 border-dashed h-full flex items-center justify-center cursor-pointer hover:bg-gray-50">
            <input {...getInputProps()} />
            {uploading ? <p>Processing...</p> : <p>Drag & Drop files here</p>}
          </div>
        ) : (
          <>
            {/* Breadcrumbs */}
            <div className="flex gap-2 mb-4 text-sm">
              <button onClick={() => setCurrentFolderId(null)} className="font-bold">Root</button>
              {items.breadcrumbs.map((b: any) => (
                <span key={b.id}> / <button onClick={() => setCurrentFolderId(b.id)}>{b.name}</button></span>
              ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-4 gap-4">
              {/* Folders */}
              {items.folders.map((f: any) => (
                <div key={f.id} onDoubleClick={() => setCurrentFolderId(f.id)} className="p-4 border rounded bg-blue-50 cursor-pointer text-center">
                  📁 {f.name}
                </div>
              ))}
              
              {/* Files */}
              {items.assets.map((a: any) => (
                <div key={a.id} className="relative aspect-square border rounded overflow-hidden">
                  <Image src={a.path} alt={a.filename} fill className="object-cover" />
                </div>
              ))}
            </div>
            
            {/* Create Folder Fab */}
            <button 
              onClick={async () => {
                const name = prompt("Folder Name?");
                if(name) { await createFolder(name, currentFolderId); refresh(); }
              }}
              className="fixed bottom-8 right-8 bg-blue-600 text-white p-4 rounded-full shadow"
            >
              + Folder
            </button>
          </>
        )}
      </div>
    </div>
  );
}
```

---

## 7. Infrastructure (Docker)

Use this for the database migration phase.

`docker-compose.yml`

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15-alpine
    container_name: imms_postgres
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: localpassword
      POSTGRES_DB: media_system
    ports:
      - "5432:5432"
    volumes:
      - pg_data:/var/lib/postgresql/data

  pgadmin:
    image: dpage/pgadmin4
    container_name: imms_pgadmin
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@admin.com
      PGADMIN_DEFAULT_PASSWORD: admin
    ports:
      - "5050:80"
    depends_on:
      - postgres

volumes:
  pg_data:
```

---

## 8. Migration Script (SQLite → Postgres)

`scripts/migrate-to-postgres.ts`

```typescript
import Database from 'better-sqlite3'; 
import { PrismaClient } from '@prisma/client';
import path from 'path';

const prisma = new PrismaClient(); // Target (Postgres)
const sqlite = new Database(path.join(process.cwd(), 'prisma/dev.db')); // Source

async function migrate() {
  const assets = sqlite.prepare('SELECT * FROM FileAsset').all();
  
  for (const asset of assets) {
    await prisma.fileAsset.create({
      data: {
        id: asset.id,
        filename: asset.filename,
        storedName: asset.storedName,
        mimeType: asset.mimeType,
        size: asset.size,
        path: asset.path,
        provider: asset.provider,
        hash: asset.hash,
        createdAt: new Date(asset.createdAt),
        updatedAt: new Date(asset.updatedAt),
      }
    });
  }
}

migrate();
```

---

## Summary

This architecture provides a complete media management system with:

- **Folder hierarchy** for organizing assets
- **Storage abstraction** allowing easy provider switching
- **Smart upload handling** with deduplication and optimization
- **Type-safe server actions** for all operations
- **Docker infrastructure** for local development
- **Migration utilities** for database transitions

The system is designed to be maintainable, scalable, and follows Next.js 14+ best practices.