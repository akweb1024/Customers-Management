import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // 1. Verify Authentication
        const authHeader = req.headers.get('authorization');
        const token = authHeader?.split(' ')[1];

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = verifyToken(token);
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
                    include: { user: { select: { role: true } } },
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
        const authHeader = req.headers.get('authorization');
        const token = authHeader?.split(' ')[1];
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const decoded = verifyToken(token);
        if (!decoded || !['SUPER_ADMIN', 'MANAGER', 'SALES_EXECUTIVE'].includes(decoded.role)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await req.json();
        const {
            institutionDetails,
            ...profileData
        } = body;

        const result = await prisma.$transaction(async (tx) => {
            const updatedProfile = await tx.customerProfile.update({
                where: { id: id },
                data: profileData
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
