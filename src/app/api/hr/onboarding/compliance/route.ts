import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authorizedRoute } from '@/lib/middleware-auth';
import { createErrorResponse } from '@/lib/api-utils';

export const dynamic = 'force-dynamic';

export const GET = authorizedRoute(
    [],
    async (req: NextRequest, user) => {
        try {
            const employee = await prisma.employeeProfile.findUnique({
                where: { userId: user.id },
                include: { user: { include: { department: true } } }
            });

            if (!employee) return createErrorResponse('Profile not found', 404);

            // 1. Check Pending Documents
            const pendingDocs = await prisma.digitalDocument.findMany({
                where: {
                    employeeId: employee.id,
                    status: 'PENDING'
                },
                select: { id: true, title: true }
            });

            // 2. Check Pending Mandatory Modules
            if (!user.companyId) return createErrorResponse('Company context required', 400);

            const requiredModules = await prisma.onboardingModule.findMany({
                where: {
                    companyId: user.companyId,
                    isActive: true,
                    OR: [
                        { type: 'COMPANY' },
                        { type: 'ROLE' },
                    ]
                }
            });

            const completedProgress = await prisma.onboardingProgress.findMany({
                where: {
                    employeeId: employee.id,
                    status: 'COMPLETED'
                },
                select: { moduleId: true }
            });

            const completedIds = new Set(completedProgress.map((p: any) => (p as any).moduleId));

            const pendingModules = (requiredModules as any[])
                .filter((m: any) => !completedIds.has(m.id))
                .map((m: any) => ({ id: m.id, title: m.title }));

            return NextResponse.json({
                isCompliant: pendingDocs.length === 0 && pendingModules.length === 0,
                pendingDocuments: pendingDocs,
                pendingModules: pendingModules
            });
        } catch (error) {
            return createErrorResponse(error);
        }
    }
);
