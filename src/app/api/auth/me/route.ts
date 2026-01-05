import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const decoded = await getAuthenticatedUser();
        if (!decoded) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            include: {
                company: true,
                companies: true,
                customerProfile: true
            }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Determing available companies
        let availableCompanies = user.companies;
        if (user.role === 'SUPER_ADMIN') {
            availableCompanies = await prisma.company.findMany();
        }

        const { password, ...userWithoutPassword } = user;

        return NextResponse.json({
            user: userWithoutPassword,
            availableCompanies
        });
    } catch (error) {
        console.error('Auth Me Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
