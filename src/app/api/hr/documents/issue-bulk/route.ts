import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

// Helper to replace placeholders (Duplicated from single issue for now, could be shared)
const hydrateTemplate = (content: string, vars: Record<string, string>) => {
    let output = content;
    Object.keys(vars).forEach(key => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        output = output.replace(regex, vars[key] || '');
    });
    return output;
};

export async function POST(req: NextRequest) {
    try {
        const user = await getAuthenticatedUser();
        if (!user || !['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'HR_MANAGER'].includes(user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { templateId, employeeIds, filters } = body;

        if (!templateId) return NextResponse.json({ error: 'Template ID required' }, { status: 400 });

        const template = await prisma.documentTemplate.findUnique({ where: { id: templateId } });
        if (!template) return NextResponse.json({ error: 'Template not found' }, { status: 404 });

        let targetEmployees: any[] = [];

        // 1. Fetch Target Employees
        if (employeeIds && Array.isArray(employeeIds) && employeeIds.length > 0) {
            targetEmployees = await prisma.employeeProfile.findMany({
                where: { id: { in: employeeIds } },
                include: { user: true }
            });
        } else if (filters) {
            const whereClause: any = {
                user: {
                    isActive: true, // Only active employees usually
                    companyId: user.companyId // Same company
                }
            };

            if (filters.departmentId) {
                // Assuming department relation exists or we filter by checking user's department? 
                // Currently schema links department to User via Companies? No, Department model exists.
                // EmployeeProfile has no direct departmentId, it's usually on User or via logic.
                // Let's check schema for Department linkage.
                // Schema: Department has users. User can be in companies.
                // Let's just use filters on User for now if passed.
            }

            // For MVP Bulk: If 'all' is true, just get all in company
            if (filters.all) {
                // No extra filters needed beyond company check
            }

            targetEmployees = await prisma.employeeProfile.findMany({
                where: whereClause,
                include: { user: true }
            });
        }

        if (targetEmployees.length === 0) {
            return NextResponse.json({ error: 'No employees found for the given criteria' }, { status: 404 });
        }

        // Fetch Company Context once
        const company = await prisma.company.findUnique({ where: { id: template.companyId } });

        const results = [];

        // 2. Issue Documents Loop
        for (const employee of targetEmployees) {
            try {
                // Prepare Variables
                const vars = {
                    name: employee.user.name || employee.user.email.split('@')[0],
                    email: employee.user.email,
                    designation: employee.designation || 'Specialist',
                    date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
                    salary: (employee.baseSalary || 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR' }),
                    address: employee.address || 'Address not provided',
                    joiningDate: employee.dateOfJoining ? new Date(employee.dateOfJoining).toLocaleDateString('en-GB') : 'Date to be decided',
                    companyName: company?.name || 'STM Journal Solutions',
                    companyAddress: company?.address || 'Noida, UP',
                };

                const resolvedContent = hydrateTemplate(template.content, vars);

                const doc = await prisma.digitalDocument.create({
                    data: {
                        templateId,
                        employeeId: employee.id,
                        title: template.title,
                        content: resolvedContent,
                        status: 'PENDING'
                    }
                });
                results.push({ id: employee.id, status: 'SUCCESS', docId: doc.id });
            } catch (err) {
                console.error(`Failed for ${employee.id}`, err);
                results.push({ id: employee.id, status: 'FAILED' });
            }
        }

        return NextResponse.json({
            success: true,
            total: targetEmployees.length,
            results
        });

    } catch (error) {
        console.error('Bulk Issue Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
