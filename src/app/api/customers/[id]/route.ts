import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // 1. Verify Authentication
        const decoded = await getAuthenticatedUser();
        if (!decoded) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        // 2. Fetch Customer Details
        const customer = await prisma.customerProfile.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        email: true,
                        role: true,
                        isActive: true,
                        lastLogin: true,
                        createdAt: true
                    }
                },
                institutionDetails: true,
                agencyDetails: true,
                assignedTo: {
                    select: { id: true, email: true, role: true, customerProfile: { select: { name: true } } }
                },
                subscriptions: {
                    include: {
                        items: {
                            include: { journal: true }
                        },
                        invoices: true
                    },
                    orderBy: { createdAt: 'desc' }
                },
                communications: {
                    include: { user: { select: { role: true, customerProfile: { select: { name: true } } } } },
                    orderBy: { date: 'desc' }
                }
            }
        });

        if (!customer) {
            return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
        }

        return NextResponse.json(customer);

    } catch (error) {
        console.error('Customer Details Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const decoded = await getAuthenticatedUser();
        if (!decoded || !['SUPER_ADMIN', 'MANAGER', 'SALES_EXECUTIVE'].includes(decoded.role)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await req.json();
        const {
            institutionDetails,
            assignedToUserId, // Allow updating assignment
            ...profileData
        } = body;

        const result = await prisma.$transaction(async (tx) => {
            const updatedProfile = await tx.customerProfile.update({
                where: { id: id },
                data: {
                    ...profileData,
                    ...(assignedToUserId !== undefined && { assignedToUserId })
                }
            });

            if (institutionDetails && updatedProfile.customerType === 'INSTITUTION') {
                await tx.institutionDetails.upsert({
                    where: { customerProfileId: id },
                    update: institutionDetails,
                    create: {
                        ...institutionDetails,
                        customerProfileId: id
                    }
                });
            }

            await tx.auditLog.create({
                data: {
                    userId: decoded.id,
                    action: 'update',
                    entity: 'customer_profile',
                    entityId: id,
                    changes: JSON.stringify(body)
                }
            });

            return updatedProfile;
        });

        return NextResponse.json(result);

    } catch (error: any) {
        console.error('Update Customer Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
