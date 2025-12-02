import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function verifyAttachments() {
    console.log('🔍 Verifying attachments for FORM_SELF posts...');

    const posts = await prisma.post.findMany({
        where: { boardType: 'FORM_SELF' },
        include: { attachments: true },
    });

    let totalAttachments = 0;
    let missingFiles = 0;
    let foundFiles = 0;

    for (const post of posts) {
        if (post.attachments.length > 0) {
            console.log(`\n[Post ${post.id}] ${post.title}`);
            for (const att of post.attachments) {
                totalAttachments++;
                // The fileUrl is stored as /wp-content/uploads/...
                // We need to check if it exists in public/wp-content/uploads/...

                // Remove leading slash for path.join if present, but public is in cwd
                const relativePath = att.fileUrl.startsWith('/') ? att.fileUrl.slice(1) : att.fileUrl;
                const absolutePath = path.join(process.cwd(), 'public', relativePath);

                if (fs.existsSync(absolutePath)) {
                    const stats = fs.statSync(absolutePath);
                    console.log(`  ✅ Found: ${att.fileName} (${stats.size} bytes)`);
                    foundFiles++;

                    // Update file size if it's 0 or different (optional, but good for accuracy)
                    if (att.fileSize === 0 || att.fileSize !== stats.size) {
                        await prisma.attachment.update({
                            where: { id: att.id },
                            data: { fileSize: stats.size }
                        });
                        console.log(`     Updated size from ${att.fileSize} to ${stats.size}`);
                    }

                } else {
                    console.log(`  ❌ Missing: ${att.fileName}`);
                    console.log(`     URL: ${att.fileUrl}`);
                    console.log(`     Path: ${absolutePath}`);
                    missingFiles++;
                }
            }
        }
    }

    console.log('\n==================================================');
    console.log(`Total Attachments: ${totalAttachments}`);
    console.log(`✅ Found: ${foundFiles}`);
    console.log(`❌ Missing: ${missingFiles}`);
    console.log('==================================================');
}

verifyAttachments()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
