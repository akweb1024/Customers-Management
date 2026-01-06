import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

// Institution-level employee assignments
export async function GET(req: NextRequest) {
    try {
        const user = await getAuthenticatedUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const institutionId = searchParams.get('institutionId');
        const employeeId = searchParams.get('employeeId');

        // Get institution with all related data
        if (institutionId) {
            const institution = await prisma.institution.findUnique({
                where: { id: institutionId },
                include: {
                    customers: {
                        include: {
                            user: { select: { email: true, isActive: true } },
                            subscriptions: {
                                include: {
                                    items: true
                                }
                            },
                            assignments: {
                                where: { isActive: true },
                                include: {
                                    employee: {
                                        select: { id: true, email: true, role: true }
                                    }
                                }
                            }
                        }
                    },
                    communications: {
                        include: {
                            customerProfile: {
                                select: { name: true, designation: true }
                            },
                            user: {
                                select: { email: true }
                            }
                        },
                        orderBy: { date: 'desc' }
                    },
                    subscriptions: {
                        include: {
                            customerProfile: {
                                select: { name: true, designation: true }
                            },
                            items: true
                        }
                    }
                }
            });

            if (!institution) {
                return NextResponse.json({ error: 'Institution not found' }, { status: 404 });
            }

            // Calculate aggregated stats
            const stats = {
                totalCustomers: institution.customers.length,
                customersByDesignation: institution.customers.reduce((acc: any, customer) => {
                    const designation = customer.designation || 'OTHER';
                    acc[designation] = (acc[designation] || 0) + 1;
                    return acc;
                }, {}),
                totalSubscriptions: institution.subscriptions.length,
                activeSubscriptions: institution.subscriptions.filter(s => s.status === 'ACTIVE').length,
                totalRevenue: institution.subscriptions.reduce((sum, sub) => sum + (sub.total || 0), 0),
                totalCommunications: institution.communications.length,
                recentCommunications: institution.communications.slice(0, 10),
                assignedEmployees: [
                    ...new Set(
                        institution.customers.flatMap(c =>
                            c.assignments.map(a => a.employee)
                        )
                    )
                ]
            };

            return NextResponse.json({
                institution,
                stats
            });
        }

        // Get all institutions assigned to an employee
        if (employeeId) {
            const assignments = await prisma.customerAssignment.findMany({
                where: {
                    employeeId,
                    isActive: true
                },
                include: {
                    customer: {
                        include: {
                            institution: {
                                select: {
                                    id: true,
                                    name: true,
                                    code: true,
                                    type: true
                                }
                            }
                        }
                    }
                }
            });

            // Group by institution
            const institutionMap = new Map();
            assignments.forEach(assignment => {
                if (assignment.customer.institution) {
                    const instId = assignment.customer.institution.id;
                    if (!institutionMap.has(instId)) {
                        institutionMap.set(instId, {
                            ...assignment.customer.institution,
                            customers: [],
                            assignmentCount: 0
                        });
                    }
                    const inst = institutionMap.get(instId);
                    inst.customers.push(assignment.customer);
                    inst.assignmentCount++;
                }
            });

            return NextResponse.json({
                institutions: Array.from(institutionMap.values())
            });
        }

        return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    } catch (error: any) {
        console.error('Institution Activity API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Bulk assign employee to all customers of an institution
export async function POST(req: NextRequest) {
    try {
        const user = await getAuthenticatedUser();
        if (!user || !['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(user.role)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await req.json();
        const { institutionId, employeeId, role, notes } = body;

        if (!institutionId || !employeeId) {
            return NextResponse.json({ error: 'Institution ID and Employee ID required' }, { status: 400 });
        }

        // Get all customers from this institution
        const customers = await prisma.customerProfile.findMany({
            where: { institutionId }
        });

        if (customers.length === 0) {
            return NextResponse.json({ error: 'No customers found for this institution' }, { status: 404 });
        }

        // Create assignments for all customers
        const assignments = await Promise.all(
            customers.map(customer =>
                prisma.customerAssignment.upsert({
                    where: {
                        customerId_employeeId: {
                            customerId: customer.id,
                            employeeId
                        }
                    },
                    create: {
                        customerId: customer.id,
                        employeeId,
                        role: role || 'Institution Manager',
                        notes: notes || `Assigned to all customers from ${institutionId}`,
                        assignedBy: user.id,
                        isActive: true
                    },
                    update: {
                        isActive: true,
                        role: role || 'Institution Manager',
                        notes: notes || `Assigned to all customers from ${institutionId}`
                    }
                })
            )
        );

        return NextResponse.json({
            success: true,
            assignedCount: assignments.length,
            message: `Successfully assigned ${employeeId} to ${assignments.length} customers from this institution`
        });
    } catch (error: any) {
        console.error('Bulk Assignment Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Remove employee from all customers of an institution
export async function DELETE(req: NextRequest) {
    try {
        const user = await getAuthenticatedUser();
        if (!user || !['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(user.role)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const institutionId = searchParams.get('institutionId');
        const employeeId = searchParams.get('employeeId');

        if (!institutionId || !employeeId) {
            return NextResponse.json({ error: 'Institution ID and Employee ID required' }, { status: 400 });
        }

        // Get all customers from this institution
        const customers = await prisma.customerProfile.findMany({
            where: { institutionId },
            select: { id: true }
        });

        // Deactivate all assignments
        const result = await prisma.customerAssignment.updateMany({
            where: {
                customerId: { in: customers.map(c => c.id) },
                employeeId,
                isActive: true
            },
            data: {
                isActive: false
            }
        });

        return NextResponse.json({
            success: true,
            deactivatedCount: result.count
        });
    } catch (error: any) {
        console.error('Bulk Deactivation Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
