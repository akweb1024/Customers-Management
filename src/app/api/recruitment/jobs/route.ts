import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth-legacy';
import { jobPostingSchema, updateJobPostingSchema } from '@/lib/validators/hr';
import { authorizedRoute } from '@/lib/middleware-auth';
import { createErrorResponse } from '@/lib/api-utils';

export async function GET(req: NextRequest) {
    try {
        const user = await getAuthenticatedUser().catch(() => null);
        const { searchParams } = new URL(req.url);
        const showAll = searchParams.get('all') === 'true';

        let where: any = { status: 'OPEN' };

        if (showAll && user && ['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(user.role)) {
            where = {}; // Managers can see all status
            if (user.companyId) {
                where.companyId = user.companyId;
            }
        }

        const jobs = await prisma.jobPosting.findMany({
            where,
            include: {
                company: { select: { name: true } },
                _count: { select: { applications: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(jobs);
    } catch (error: any) {
        return createErrorResponse(error);
    }
}

export const POST = authorizedRoute(
    ['SUPER_ADMIN', 'ADMIN', 'MANAGER'],
    async (req: NextRequest, user) => {
        try {
            const body = await req.json();

            const validation = jobPostingSchema.safeParse(body);
            if (!validation.success) {
                return createErrorResponse(validation.error);
            }

            const { examQuestions, ...jobData } = validation.data;

            const finalCompanyId = user.companyId;

            if (!finalCompanyId) {
                return createErrorResponse('Company association required.', 400);
            }

            const job = await prisma.jobPosting.create({
                data: {
                    companyId: finalCompanyId,
                    ...jobData,
                    exam: {
                        create: {
                            questions: examQuestions || [],
                        }
                    }
                }
            });

            return NextResponse.json(job);
        } catch (error: any) {
            return createErrorResponse(error);
        }
    }
);

export const PATCH = authorizedRoute(
    ['SUPER_ADMIN', 'ADMIN', 'MANAGER'],
    async (req: NextRequest, user) => {
        try {
            const body = await req.json();
            const validation = updateJobPostingSchema.safeParse(body);

            if (!validation.success) {
                return createErrorResponse(validation.error);
            }

            const { id, ...updates } = validation.data;
            if (!id) return createErrorResponse('ID is required', 400);

            const job = await prisma.jobPosting.update({
                where: { id },
                data: updates
            });

            return NextResponse.json(job);
        } catch (error: any) {
            return createErrorResponse(error);
        }
    }
);
