import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth-legacy';

export async function GET(req: NextRequest) {
    try {
        const user = await getAuthenticatedUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const companyId = (user as any).companyId;

        // Filters
        const { searchParams } = new URL(req.url);
        const type = searchParams.get('type');
        const status = searchParams.get('status');

        const where: any = { companyId };
        if (type) where.type = type;
        if (status) where.status = status;

        const assets = await prisma.iTAsset.findMany({
            where,
            include: {
                assignedTo: {
                    select: { id: true, name: true, email: true, department: { select: { name: true } } }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(assets);
    } catch (error) {
        console.error('Fetch Assets Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const user = await getAuthenticatedUser();
        if (!user || !['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'IT_MANAGER', 'IT_ADMIN'].includes(user.role)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await req.json();
        const { name, type, serialNumber, status, value, assignedToId, details, purchaseDate } = body;

        const asset = await prisma.iTAsset.create({
            data: {
                companyId: (user as any).companyId,
                name,
                type,
                serialNumber,
                status: status || 'AVAILABLE',
                value: value ? parseFloat(value) : null,
                assignedToId: assignedToId || null,
                details: details || '',
                purchaseDate: purchaseDate ? new Date(purchaseDate) : null
            }
        });

        return NextResponse.json(asset);
    } catch (error) {
        console.error('Create Asset Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
