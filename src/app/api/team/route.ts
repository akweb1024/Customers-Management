import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        const decoded = await getAuthenticatedUser();
        if (!decoded || !['SUPER_ADMIN', 'MANAGER'].includes(decoded.role)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const where: any = {
            role: { in: ['SALES_EXECUTIVE', 'FINANCE_ADMIN', 'MANAGER', 'SUPER_ADMIN'] }
        };

        const userCompanyId = (decoded as any).companyId;
        if (userCompanyId) {
            where.companies = { some: { id: userCompanyId } };
        }

        const team = await prisma.user.findMany({
            where,
            select: {
                id: true,
                email: true,
                role: true,
                isActive: true,
                lastLogin: true,
                createdAt: true,
                _count: {
                    select: {
                        assignedSubscriptions: true,
                        tasks: { where: { status: 'PENDING' } }
                    }
                }
            }
        });

        return NextResponse.json(team);

    } catch (error: any) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
