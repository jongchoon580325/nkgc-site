import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function resetAdminPassword() {
    const password = 'admin1234'; // 사용자에게 알려줄 임시 비밀번호
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.upsert({
        where: { username: 'admin' },
        update: {
            password: hashedPassword,
            isApproved: true,
        },
        create: {
            username: 'admin',
            password: hashedPassword,
            name: 'Admin',
            email: 'admin@example.com',
            phone: '010-0000-0000',
            churchName: 'System',
            position: '관리자',
            role: 'admin',
            isApproved: true,
        },
    });

    console.log('✅ Admin account created/updated successfully');
    console.log('Username: admin');
    console.log('Password: admin1234');
    console.log('\n⚠️  Please change this password after first login!');

    await prisma.$disconnect();
}

resetAdminPassword().catch(console.error);
