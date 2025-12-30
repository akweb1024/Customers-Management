import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';
import { createNotification } from '@/lib/notifications';

export async function POST(req: NextRequest) {
    try {
        const decoded = await getAuthenticatedUser();
        if (!decoded || !['SUPER_ADMIN', 'MANAGER'].includes(decoded.role)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await req.json();
        const { assignedToUserId, filters, customerIds } = body;

        if (!assignedToUserId && assignedToUserId !== null) { // Allow null to unassign
            return NextResponse.json({ error: 'Target user is required' }, { status: 400 });
        }

        const where: any = {};
        const userCompanyId = (decoded as any).companyId;

        // Multi-tenancy: Restrict to company if not SUPER_ADMIN
        if (decoded.role !== 'SUPER_ADMIN' && userCompanyId) {
            where.companyId = userCompanyId;
        }

        if (customerIds && Array.isArray(customerIds) && customerIds.length > 0) {
            where.id = { in: customerIds };
        } else if (filters && Object.keys(filters).length > 0) {
            // Apply filters
            if (filters.country) where.country = { contains: filters.country };
            if (filters.state) where.state = { contains: filters.state };
            if (filters.customerType) where.customerType = filters.customerType;
            if (filters.organizationName) where.organizationName = { contains: filters.organizationName };
        } else {
            return NextResponse.json({ error: 'Either specific customers or filters are required' }, { status: 400 });
        }

        const result = await prisma.customerProfile.updateMany({
            where,
            data: {
                assignedToUserId
            }
        });

        if (assignedToUserId && result.count > 0) {
            await createNotification({
                userId: assignedToUserId,
                title: 'Bulk Customer Assignment',
                message: `${result.count} new customers have been assigned to you.`,
                type: 'INFO',
                link: '/dashboard/customers'
            });
        }

        await prisma.auditLog.create({
            data: {
                userId: decoded.id,
                action: 'bulk_assign',
                entity: 'customer_profile',
                entityId: 'bulk',
                changes: JSON.stringify({ filters, assignedToUserId, count: result.count })
            }
        });

        return NextResponse.json({ message: 'Assignment complete', count: result.count });

    } catch (error: any) {
        console.error('Bulk Assign Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
