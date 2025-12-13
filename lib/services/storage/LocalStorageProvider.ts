import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { IStorageProvider } from './StorageInterface';

export class LocalStorageProvider implements IStorageProvider {
    private uploadDir: string;

    constructor() {
        this.uploadDir = path.join(process.cwd(), 'public', 'uploads');
    }

    async upload(file: Buffer, fileName: string, mimeType: string): Promise<string> {
        // Ensure directory exists: public/uploads/YYYY/MM
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const relativePath = `${year}/${month}`;
        const targetDir = path.join(this.uploadDir, relativePath);

        try {
            await fs.mkdir(targetDir, { recursive: true });
        } catch (error) {
            // Ignore if exists
        }

        let finalBuffer = file;
        let finalName = fileName;

        // Optimization: Resize & Compress Images
        // Only applied if explicitly an image and sharp is available
        if (mimeType.startsWith('image/')) {
            try {
                finalBuffer = await sharp(file)
                    .resize({ width: 1920, withoutEnlargement: true }) // Limit max width
                    .webp({ quality: 80 }) // Convert to WebP
                    .toBuffer();

                // Change extension to .webp
                finalName = finalName.replace(/\.[^/.]+$/, "") + ".webp";
            } catch (error) {
                console.error("Image optimization failed, falling back to original:", error);
            }
        }

        const filePath = path.join(targetDir, finalName);
        await fs.writeFile(filePath, finalBuffer);

        // Return public URL path
        return `/uploads/${relativePath}/${finalName}`;
    }

    async delete(publicPath: string): Promise<void> {
        // publicPath example: /uploads/2024/12/abc.webp
        // Map to absolute path
        const relativePath = publicPath.replace(/^\/uploads\//, ''); // Remove leading /uploads/
        const fullPath = path.join(this.uploadDir, relativePath);

        try {
            await fs.unlink(fullPath);
        } catch (error) {
            console.error(`Failed to delete file at ${fullPath}`, error);
        }
    }
}
