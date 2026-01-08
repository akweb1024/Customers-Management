import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authorizedRoute } from '@/lib/middleware-auth';
import { createErrorResponse } from '@/lib/api-utils';

export const GET = authorizedRoute(
    ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'TEAM_LEADER'],
    async (req: NextRequest, user) => {
        try {
            const where: any = {
                role: { in: ['SALES_EXECUTIVE', 'FINANCE_ADMIN', 'MANAGER', 'SUPER_ADMIN', 'ADMIN', 'TEAM_LEADER'] }
            };

            const userCompanyId = user.companyId;
            if (userCompanyId && user.role !== 'SUPER_ADMIN') {
                where.companyId = userCompanyId;
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
            console.error('Fetch Team Error:', error);
            return createErrorResponse('Internal Server Error', 500);
        }
    }
);
