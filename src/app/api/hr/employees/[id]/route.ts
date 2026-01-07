import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    try {
        const params = await props.params;
        const user = await getAuthenticatedUser();
        if (!user || !['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(user.role)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { id } = params;

        const employee = await prisma.employeeProfile.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        email: true,
                        role: true,
                        isActive: true
                    }
                },
                incrementHistory: {
                    orderBy: { date: 'desc' }
                },
                hrComments: {
                    orderBy: { createdAt: 'desc' },
                    include: {
                        author: { select: { email: true } }
                    }
                },
                workReports: {
                    orderBy: { date: 'desc' },
                    take: 50
                },
                attendance: {
                    orderBy: { date: 'desc' },
                    take: 30
                },
                documents: true,
                designatRef: true
            }
        });

        if (!employee) {
            return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
        }

        return NextResponse.json(employee);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
