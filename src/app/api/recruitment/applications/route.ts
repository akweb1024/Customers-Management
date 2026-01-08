import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authorizedRoute } from '@/lib/middleware-auth';
import { createErrorResponse } from '@/lib/api-utils';

export const GET = authorizedRoute(
    ['SUPER_ADMIN', 'ADMIN', 'MANAGER'],
    async (req: NextRequest, user) => {
        try {
            const where: any = {};
            if (user.companyId) {
                where.jobPosting = { companyId: user.companyId };
            }

            const applications = await prisma.jobApplication.findMany({
                where,
                include: {
                    jobPosting: true,
                    examAttempt: true,
                    interviews: true
                },
                orderBy: { createdAt: 'desc' }
            });

            return NextResponse.json(applications);
        } catch (error: any) {
            return createErrorResponse(error);
        }
    }
);
