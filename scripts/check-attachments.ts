import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function checkAttachments() {
    console.log('🔍 Checking attachments...');

    const attachments = await prisma.attachment.findMany();
    console.log(`Found ${attachments.length} attachments in DB.`);

    let missingCount = 0;
    let sizeMismatchCount = 0;
    let fixedCount = 0;

    for (const att of attachments) {
        // Construct physical path
        // fileUrl usually starts with /wp-content/uploads/ or /uploads/
        let relativePath = att.fileUrl;

        // Handle URL encoding if present
        try {
            relativePath = decodeURIComponent(relativePath);
        } catch (e) {
            // ignore error
        }

        if (relativePath.startsWith('/')) {
            relativePath = relativePath.substring(1);
        }

        const physicalPath = path.join(process.cwd(), 'public', relativePath);

        if (!fs.existsSync(physicalPath)) {
            // Try checking without decoding if it failed
            const rawPath = path.join(process.cwd(), 'public', att.fileUrl.startsWith('/') ? att.fileUrl.substring(1) : att.fileUrl);
            if (fs.existsSync(rawPath)) {
                // Found with raw path
                const stats = fs.statSync(rawPath);
                const actualSize = stats.size;

                if (att.fileSize !== actualSize) {
                    console.log(`⚠️ Size mismatch (Raw Path): ID ${att.id} - DB: ${att.fileSize}, Actual: ${actualSize}`);
                    await prisma.attachment.update({
                        where: { id: att.id },
                        data: { fileSize: actualSize },
                    });
                    console.log(`   ✅ Updated size for ID ${att.id}`);
                    fixedCount++;
                    sizeMismatchCount++;
                }
                continue;
            }

            console.log(`❌ Missing file: ID ${att.id} - ${att.fileUrl}`);
            missingCount++;
            continue;
        }

        const stats = fs.statSync(physicalPath);
        const actualSize = stats.size;

        if (att.fileSize !== actualSize) {
            console.log(`⚠️ Size mismatch: ID ${att.id} - DB: ${att.fileSize}, Actual: ${actualSize}`);

            // Update DB
            await prisma.attachment.update({
                where: { id: att.id },
                data: { fileSize: actualSize },
            });
            console.log(`   ✅ Updated size for ID ${att.id}`);
            fixedCount++;
            sizeMismatchCount++;
        }
    }

    console.log('\n--- Summary ---');
    console.log(`Total: ${attachments.length}`);
    console.log(`Missing: ${missingCount}`);
    console.log(`Size Mismatch (Fixed): ${sizeMismatchCount}`);
}

checkAttachments()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
