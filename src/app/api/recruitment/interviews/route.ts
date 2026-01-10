import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authorizedRoute } from '@/lib/middleware-auth';
import { createErrorResponse } from '@/lib/api-utils';

export const GET = authorizedRoute(
    ['SUPER_ADMIN', 'ADMIN', 'HR_MANAGER', 'MANAGER'],
    async (req: NextRequest, user) => {
        try {
            const { searchParams } = new URL(req.url);
            const applicationId = searchParams.get('applicationId');

            const where: any = {};
            if (applicationId) where.applicationId = applicationId;

            // To filter by company, we need to join the application -> job -> company
            // Or use the interviewer's company if they are internal
            where.interviewer = { companyId: user.companyId };

            const interviews = await prisma.interview.findMany({
                where,
                include: {
                    application: { select: { candidateName: true, job: { select: { title: true } } } },
                    interviewer: { select: { name: true } }
                },
                orderBy: { scheduledAt: 'asc' }
            });

            return NextResponse.json(interviews);
        } catch (error) {
            return createErrorResponse(error);
        }
    }
);

export const POST = authorizedRoute(
    ['SUPER_ADMIN', 'ADMIN', 'HR_MANAGER', 'MANAGER'],
    async (req: NextRequest, user) => {
        try {
            const body = await req.json();
            const { applicationId, interviewerId, scheduledAt, duration, type, meetingLink, location } = body;

            if (!applicationId || !interviewerId || !scheduledAt) {
                return createErrorResponse('Missing required fields', 400);
            }

            const interview = await prisma.interview.create({
                data: {
                    applicationId,
                    interviewerId,
                    scheduledAt: new Date(scheduledAt),
                    duration: duration || 30,
                    type: type || 'VIRTUAL',
                    meetingLink,
                    location,
                    status: 'SCHEDULED'
                }
            });

            // Update application status
            await prisma.jobApplication.update({
                where: { id: applicationId },
                data: { status: 'INTERVIEW', currentStage: 'ROUND_1' }
            });

            return NextResponse.json(interview);
        } catch (error) {
            return createErrorResponse(error);
        }
    }
);

export const PATCH = authorizedRoute(
    ['SUPER_ADMIN', 'ADMIN', 'HR_MANAGER', 'MANAGER'],
    async (req: NextRequest, user) => {
        try {
            const body = await req.json();
            const { id, status, feedback, rating } = body;

            if (!id) return createErrorResponse('Interview ID required', 400);

            const interview = await prisma.interview.update({
                where: { id },
                data: {
                    status,
                    feedback,
                    rating
                }
            });

            return NextResponse.json(interview);
        } catch (error) {
            return createErrorResponse(error);
        }
    }
);
