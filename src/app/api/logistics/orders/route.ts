import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        const user = await getAuthenticatedUser();
        // Logistics likely restricted to admin/manager
        if (!user || !['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);

        let where: any = {};
        if (user.companyId) {
            where.companyId = user.companyId;
        }

        const orders = await prisma.dispatchOrder.findMany({
            where,
            include: {
                courier: true
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(orders);

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const user = await getAuthenticatedUser();
        if (!user || !['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(user.role)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await req.json();
        const { recipientName, address, city, state, pincode, country, phone, items, courierId, trackingNumber } = body;

        const order = await prisma.dispatchOrder.create({
            data: {
                recipientName,
                address,
                city,
                state,
                pincode,
                country,
                phone,
                items, // JSON
                courierId,
                trackingNumber,
                status: 'PENDING',
                companyId: user.companyId
            }
        });

        return NextResponse.json(order);

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
