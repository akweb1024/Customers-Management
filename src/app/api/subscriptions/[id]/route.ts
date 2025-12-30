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
        if (!decoded || !decoded.role) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        // 2. Fetch Subscription with details
        const subscription = await prisma.subscription.findUnique({
            where: { id },
            include: {
                customerProfile: true,
                items: {
                    include: {
                        journal: true,
                        plan: true
                    }
                },
                invoices: {
                    orderBy: { createdAt: 'desc' },
                    take: 5
                },
                agency: true,
                salesExecutive: {
                    select: {
                        id: true,
                        email: true,
                        customerProfile: {
                            select: { name: true }
                        }
                    }
                }
            }
        });

        if (!subscription) {
            return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
        }

        // 3. Authorization check for CUSTOMER role
        if (decoded.role === 'CUSTOMER') {
            const customerProfile = await prisma.customerProfile.findUnique({
                where: { userId: decoded.id }
            });
            if (!customerProfile || subscription.customerProfileId !== customerProfile.id) {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }
        }

        return NextResponse.json(subscription);

    } catch (error: any) {
        console.error('Subscription Detail API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // 1. Verify Authentication
        const decoded = await getAuthenticatedUser();
        if (!decoded || !['SUPER_ADMIN', 'SALES_EXECUTIVE', 'MANAGER'].includes(decoded.role)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await req.json();
        const { status, autoRenew } = body;

        // 2. Update Subscription
        const updatedSubscription = await prisma.subscription.update({
            where: { id },
            data: {
                ...(status && { status }),
                ...(autoRenew !== undefined && { autoRenew })
            }
        });

        // 3. Log Audit
        await prisma.auditLog.create({
            data: {
                userId: decoded.id,
                action: 'update',
                entity: 'subscription',
                entityId: id,
                changes: JSON.stringify(body)
            }
        });

        return NextResponse.json(updatedSubscription);

    } catch (error: any) {
        console.error('Subscription Update API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
