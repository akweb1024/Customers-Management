import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authorizedRoute } from '@/lib/middleware-auth';
import { createErrorResponse } from '@/lib/api-utils';

export const GET = authorizedRoute(
    ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'HR_MANAGER'],
    async (req: NextRequest, user) => {
        try {
            const { searchParams } = new URL(req.url);
            const month = parseInt(searchParams.get('month') || (new Date().getMonth() + 1).toString());
            const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());

            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0);

            const employees = await prisma.employeeProfile.findMany({
                where: {
                    user: {
                        companyId: user.companyId || undefined,
                        isActive: true
                    }
                },
                include: {
                    user: {
                        select: {
                            name: true,
                            department: { select: { name: true } }
                        }
                    },
                    leaveRequests: {
                        where: {
                            status: 'APPROVED',
                            startDate: { lte: endDate },
                            endDate: { gte: startDate }
                        }
                    }
                }
            });

            const stats = employees.map(emp => {
                let currentMonthLeaveDays = 0;

                emp.leaveRequests.forEach(leave => {
                    const start = new Date(Math.max(leave.startDate.getTime(), startDate.getTime()));
                    const end = new Date(Math.min(leave.endDate.getTime(), endDate.getTime()));
                    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                    currentMonthLeaveDays += diff;
                });

                const balLeave = emp.leaveBalance;
                const leaveTaken = currentMonthLeaveDays;

                let overheadLeave = 0;
                let finalBalLeave = balLeave;

                if (leaveTaken > balLeave) {
                    overheadLeave = leaveTaken - balLeave;
                    finalBalLeave = 0;
                } else {
                    finalBalLeave = balLeave - leaveTaken;
                }

                return {
                    id: emp.id,
                    employeeId: emp.employeeId,
                    name: emp.user.name,
                    department: emp.user.department?.name || 'N/A',
                    balLeave: finalBalLeave,
                    leaveTaken: leaveTaken,
                    overheadLeave: overheadLeave,
                    designation: emp.designation
                };
            });

            return NextResponse.json(stats);
        } catch (error) {
            return createErrorResponse(error);
        }
    }
);
