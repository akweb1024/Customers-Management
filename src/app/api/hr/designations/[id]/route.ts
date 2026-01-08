import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authorizedRoute } from '@/lib/middleware-auth';
import { createErrorResponse } from '@/lib/api-utils';

export const PATCH = authorizedRoute(
    ['SUPER_ADMIN', 'ADMIN', 'MANAGER'],
    async (req: NextRequest, user, { params }) => {
        try {
            const { id: designationId } = await params;
            const body = await req.json();

            const updated = await prisma.designation.update({
                where: { id: designationId },
                data: {
                    name: body.name,
                    code: body.code,
                    jobDescription: body.jobDescription,
                    kra: body.kra,
                    expectedExperience: body.expectedExperience ? parseFloat(body.expectedExperience) : undefined,
                    promotionWaitPeriod: body.promotionWaitPeriod ? parseInt(body.promotionWaitPeriod) : undefined,
                    incrementGuidelines: body.incrementGuidelines,
                    level: body.level ? parseInt(body.level) : undefined
                }
            });

            return NextResponse.json(updated);
        } catch (error) {
            return createErrorResponse(error);
        }
    }
);

export const DELETE = authorizedRoute(
    ['SUPER_ADMIN', 'ADMIN', 'MANAGER'],
    async (req: NextRequest, user, { params }) => {
        try {
            const { id } = await params;

            await prisma.designation.delete({
                where: { id: id }
            });

            return NextResponse.json({ success: true });
        } catch (error) {
            return createErrorResponse(error);
        }
    }
);
