
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const email = 'nisargramani5@gmail.com';
    console.log('Updating role for:', email);
    try {
        const user = await prisma.user.update({
            where: { email },
            data: { role: 'VENDOR' }
        });
        console.log('SUCCESS: User role updated to VENDOR:', user.id);

        if (!user.password) {
            console.log('WARNING: User has no password set (OAuth user?)');
        }
    } catch (e) {
        console.error('FAILED to update user:', e);
    }
}

main().finally(() => prisma.$disconnect());
