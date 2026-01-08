import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authorizedRoute } from '@/lib/middleware-auth';
import { createErrorResponse } from '@/lib/api-utils';

export const GET = authorizedRoute(
    ['SUPER_ADMIN', 'ADMIN', 'MANAGER'],
    async (req: NextRequest, user) => {
        try {
            const outOfBounds = await prisma.attendance.findMany({
                where: {
                    companyId: user.companyId || undefined,
                    workFrom: 'OFFICE',
                    isGeofenced: false
                },
                include: {
                    employee: {
                        include: { user: { select: { email: true } } }
                    }
                },
                orderBy: { date: 'desc' }
            });

            return NextResponse.json(outOfBounds);
        } catch (error) {
            return createErrorResponse(error);
        }
    }
);
