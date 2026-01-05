const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    try {
        const user = await prisma.user.findFirst({
            include: {
                companies: true,
                assignedToCustomers: true
            }
        });
        console.log('SUCCESS: Relation query works');
        console.log('User companies count:', user?.companies?.length || 0);
    } catch (err) {
        console.error('FAILURE: Relation query failed');
        console.error(err.message);
    } finally {
        await prisma.$disconnect();
    }
}

check();
