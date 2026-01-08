import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authorizedRoute } from '@/lib/middleware-auth';
import { createErrorResponse } from '@/lib/api-utils';

export const GET = authorizedRoute(
    ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'SALES_EXECUTIVE', 'TEAM_LEADER'],
    async (req: NextRequest, user) => {
        try {
            const companyId = user.companyId;
            if (!companyId) return createErrorResponse('No company context', 400);

            const designations = await prisma.designation.findMany({
                where: { companyId },
                orderBy: { level: 'asc' }
            });

            return NextResponse.json(designations);
        } catch (error) {
            return createErrorResponse(error);
        }
    }
);

export const POST = authorizedRoute(
    ['SUPER_ADMIN', 'ADMIN', 'MANAGER'],
    async (req: NextRequest, user) => {
        try {
            const companyId = user.companyId;
            if (!companyId) return createErrorResponse('No company context', 400);
            const body = await req.json();
            const { name, code, jobDescription, kra, expectedExperience, promotionWaitPeriod, incrementGuidelines, level } = body;

            if (!name) return createErrorResponse('Name is required', 400);

            const designation = await prisma.designation.create({
                data: {
                    companyId,
                    name,
                    code,
                    jobDescription,
                    kra,
                    expectedExperience: parseFloat(expectedExperience) || 0,
                    promotionWaitPeriod: parseInt(promotionWaitPeriod) || 12,
                    incrementGuidelines,
                    level: parseInt(level) || 1
                }
            });

            return NextResponse.json(designation);
        } catch (error) {
            return createErrorResponse(error);
        }
    }
);
