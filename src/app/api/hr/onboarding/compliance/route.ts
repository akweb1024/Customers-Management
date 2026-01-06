import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const user = await getAuthenticatedUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const employee = await prisma.employeeProfile.findUnique({
            where: { userId: user.id },
            include: { user: { include: { department: true } } }
        });

        if (!employee) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

        // 1. Check Pending Documents
        const pendingDocs = await prisma.digitalDocument.findMany({
            where: {
                employeeId: employee.id,
                status: 'PENDING'
            },
            select: { id: true, title: true }
        });

        // 2. Check Pending Mandatory Modules
        // Fetch all modules required for this user's role/dept/company
        // AND which are NOT completed in OnboardingProgress

        // This is complex because we need to find "Required Modules" first
        const requiredModules = await prisma.onboardingModule.findMany({
            where: {
                companyId: user.companyId!,
                isActive: true,
                OR: [
                    { type: 'COMPANY' },
                    { type: 'ROLE' }, // Assumes 'ROLE' type modules are generic or handled by designation
                    // { type: 'DEPARTMENT', departmentId: employee.departmentId } // TODO: Add department relation to EmployeeProfile correctly or fetch dept id
                ]
            }
        });

        // Filter for modules that specifically require this designation (if applicable)
        // If requiredForDesignation is null/empty, it applies to all in that role/type.
        // If it returns a string, we match.
        // Note: Logic simplification for this mvp: If it matches Role/Company, it's required.

        const completedProgress = await prisma.onboardingProgress.findMany({
            where: {
                employeeId: employee.id,
                status: 'COMPLETED'
            },
            select: { moduleId: true }
        });

        const completedIds = new Set(completedProgress.map((p: any) => p.moduleId));

        const pendingModules = requiredModules
            .filter((m: any) => !completedIds.has(m.id))
            .map((m: any) => ({ id: m.id, title: m.title }));

        return NextResponse.json({
            isCompliant: pendingDocs.length === 0 && pendingModules.length === 0,
            pendingDocuments: pendingDocs,
            pendingModules: pendingModules
        });

    } catch (error) {
        console.error('Compliance Check Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
