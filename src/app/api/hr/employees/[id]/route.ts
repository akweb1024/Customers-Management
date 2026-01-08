import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authorizedRoute } from '@/lib/middleware-auth';
import { createErrorResponse } from '@/lib/api-utils';

export const GET = authorizedRoute(
    ['SUPER_ADMIN', 'ADMIN', 'MANAGER'],
    async (req: NextRequest, user) => {
        try {
            const url = new URL(req.url);
            const id = url.pathname.split('/').pop();

            if (!id) {
                return createErrorResponse('Employee ID is required', 400);
            }

            const employee = await prisma.employeeProfile.findUnique({
                where: { id },
                include: {
                    user: {
                        select: {
                            email: true,
                            role: true,
                            isActive: true,
                            name: true
                        }
                    },
                    incrementHistory: {
                        orderBy: { date: 'desc' }
                    },
                    hrComments: {
                        orderBy: { createdAt: 'desc' },
                        include: {
                            author: { select: { email: true, name: true } }
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
                    designatRef: true,
                    leaveRequests: {
                        orderBy: {
                            startDate: 'desc'
                        }
                    }
                }
            });

            if (!employee) {
                return createErrorResponse('Employee not found', 404);
            }

            return NextResponse.json(employee);
        } catch (error) {
            return createErrorResponse(error);
        }
    }
);
