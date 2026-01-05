import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        const user = await getAuthenticatedUser();
        if (!user || !['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(user.role)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const outOfBounds = await prisma.attendance.findMany({
            where: {
                companyId: user.companyId || undefined,
                workFrom: 'OFFICE',
                isGeofenced: false
            },
            include: {
                employee: {
                    include: { user: { select: { email: true } } }
                }
            },
            orderBy: { date: 'desc' }
        });

        return NextResponse.json(outOfBounds);

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
