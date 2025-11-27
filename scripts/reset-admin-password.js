const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
    const username = 'admin';
    const password = 'admin1234'; // 사용자가 요청한 비밀번호
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const user = await prisma.user.upsert({
            where: { username },
            update: {
                password: hashedPassword,
                isApproved: true,
                role: 'ADMIN'
            },
            create: {
                username,
                password: hashedPassword,
                name: '관리자',
                email: 'admin@example.com',
                role: 'ADMIN',
                isApproved: true,
                phone: '010-0000-0000',
                churchName: '남경기노회',
                position: '관리자'
            },
        });

        console.log(`Admin user '${user.username}' password reset to '${password}' successfully.`);
    } catch (error) {
        console.error('Error resetting admin password:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
