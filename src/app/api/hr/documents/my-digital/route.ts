import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authorizedRoute } from '@/lib/middleware-auth';
import { createErrorResponse } from '@/lib/api-utils';

export const GET = authorizedRoute(
    [],
    async (req: NextRequest, user) => {
        try {
            // Get Employee Profile
            const employee = await prisma.employeeProfile.findFirst({
                where: { userId: user.id }
            });

            if (!employee) return createErrorResponse('Profile not found', 404);

            const docs = await prisma.digitalDocument.findMany({
                where: { employeeId: employee.id },
                orderBy: { createdAt: 'desc' }
            });

            return NextResponse.json(docs);
        } catch (error) {
            return createErrorResponse(error);
        }
    }
);
