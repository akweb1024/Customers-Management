import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authorizedRoute } from '@/lib/middleware-auth';
import { createErrorResponse } from '@/lib/api-utils';

export const GET = authorizedRoute(
    [],
    async (req: NextRequest, user) => {
        try {
            const { searchParams } = new URL(req.url);
            const employeeId = searchParams.get('employeeId');
            const showAll = searchParams.get('all') === 'true';

            const where: any = {};

            if (employeeId) {
                if (!['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(user.role)) {
                    return createErrorResponse('Forbidden', 403);
                }
                where.employeeId = employeeId;
                if (user.companyId) {
                    where.employee = { user: { companyId: user.companyId } };
                }
            } else if (showAll && ['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(user.role)) {
                if (user.companyId) {
                    where.employee = { user: { companyId: user.companyId } };
                }
            } else {
                const profile = await prisma.employeeProfile.findUnique({
                    where: { userId: user.id }
                });
                if (!profile) return NextResponse.json([]);
                where.employeeId = profile.id;
            }

            const slips = await prisma.salarySlip.findMany({
                where,
                include: {
                    employee: {
                        include: { user: { select: { email: true } } }
                    }
                },
                orderBy: [{ year: 'desc' }, { month: 'desc' }]
            });

            return NextResponse.json(slips);
        } catch (error) {
            return createErrorResponse(error);
        }
    }
);

export const POST = authorizedRoute(
    ['SUPER_ADMIN', 'ADMIN', 'FINANCE_ADMIN', 'HR_MANAGER', 'MANAGER'],
    async (req: NextRequest, user) => {
        try {
            const body = await req.json();

            // Handle Bulk Generation
            if (body.action === 'BULK_GENERATE') {
                const { month, year } = body;
                const employees = await prisma.employeeProfile.findMany({
                    where: {
                        user: { isActive: true, companyId: user.companyId }
                    }
                });

                const getMonthsDiff = (d1: Date, d2: Date) => {
                    let months = (d2.getFullYear() - d1.getFullYear()) * 12;
                    months -= d1.getMonth();
                    months += d2.getMonth();
                    return months <= 0 ? 0 : months;
                };

                let generatedCount = 0;
                for (const emp of employees) {
                    if (!emp.baseSalary) continue;

                    const existing = await prisma.salarySlip.findFirst({
                        where: {
                            employeeId: emp.id,
                            month: parseInt(month),
                            year: parseInt(year)
                        }
                    });
                    if (existing) continue;

                    let payableSalary = emp.baseSalary || 0;
                    let deduction = 0;
                    let lopDays = 0;

                    if (emp.dateOfJoining) {
                        const payMonthStart = new Date(parseInt(year), parseInt(month) - 1, 1);
                        const payMonthEnd = new Date(parseInt(year), parseInt(month), 0);

                        const totalMonthsBefore = getMonthsDiff(new Date(emp.dateOfJoining), payMonthStart);
                        const openingAccrued = (totalMonthsBefore < 0 ? 0 : totalMonthsBefore) * 1.5;

                        const pastLeaves = await prisma.leaveRequest.findMany({
                            where: {
                                employeeId: emp.id,
                                status: 'APPROVED',
                                endDate: { lt: payMonthStart }
                            }
                        });

                        let pastDaysTaken = 0;
                        pastLeaves.forEach(l => {
                            const start = new Date(l.startDate);
                            const end = new Date(l.endDate);
                            const diffDays = Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                            pastDaysTaken += diffDays;
                        });

                        const openingBalance = openingAccrued - pastDaysTaken;
                        const usefulOpeningBalance = openingBalance > 0 ? openingBalance : 0;

                        const currentLeaves = await prisma.leaveRequest.findMany({
                            where: {
                                employeeId: emp.id,
                                status: 'APPROVED',
                                startDate: { gte: payMonthStart },
                                endDate: { lte: payMonthEnd }
                            }
                        });

                        let currentDaysTaken = 0;
                        currentLeaves.forEach(l => {
                            const start = new Date(l.startDate);
                            const end = new Date(l.endDate);
                            const diffDays = Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                            currentDaysTaken += diffDays;
                        });

                        const availableToCover = usefulOpeningBalance + 1.5;

                        if (currentDaysTaken > availableToCover) {
                            lopDays = currentDaysTaken - availableToCover;
                            lopDays = Math.max(0, lopDays);

                            const dailyRate = payableSalary / 30;
                            deduction = dailyRate * lopDays;
                            payableSalary = payableSalary - deduction;
                        }
                    }

                    await prisma.salarySlip.create({
                        data: {
                            employeeId: emp.id,
                            month: parseInt(month),
                            year: parseInt(year),
                            amountPaid: payableSalary > 0 ? payableSalary : 0,
                            status: 'GENERATED'
                        }
                    });
                    generatedCount++;
                }

                return NextResponse.json({ message: `Generated ${generatedCount} salary slips`, count: generatedCount });
            }

            // Single Creation
            const { employeeId, month, year, amountPaid, status } = body;

            const slip = await prisma.salarySlip.create({
                data: {
                    employeeId,
                    month: parseInt(month),
                    year: parseInt(year),
                    amountPaid: parseFloat(amountPaid),
                    status: status || 'GENERATED'
                }
            });

            return NextResponse.json(slip);
        } catch (error) {
            return createErrorResponse(error);
        }
    }
);
