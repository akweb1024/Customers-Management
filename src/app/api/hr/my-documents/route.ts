import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authorizedRoute } from '@/lib/middleware-auth';
import { createErrorResponse } from '@/lib/api-utils';

export const GET = authorizedRoute(
    [],
    async (req: NextRequest, user) => {
        try {
            const application = await prisma.jobApplication.findFirst({
                where: { applicantEmail: user.email },
                include: {
                    jobPosting: {
                        include: {
                            company: { select: { name: true } }
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });

            const profile = await prisma.employeeProfile.findUnique({
                where: { userId: user.id },
                include: { documents: true }
            });

            return NextResponse.json({
                application,
                profile
            });
        } catch (error) {
            return createErrorResponse(error);
        }
    }
);
