import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        const user = await getAuthenticatedUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const companyId = searchParams.get('companyId') || (user as any).companyId;

        const holidays = await prisma.holiday.findMany({
            where: {
                OR: [
                    { companyId },
                    { companyId: null } // Global holidays
                ]
            },
            orderBy: { date: 'asc' }
        });

        return NextResponse.json(holidays);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const user = await getAuthenticatedUser();
        if (!user || !['SUPER_ADMIN', 'ADMIN', 'HR_MANAGER'].includes(user.role)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await req.json();
        const { name, date, type, description } = body;

        const holiday = await prisma.holiday.create({
            data: {
                name,
                date: new Date(date),
                type: type || 'PUBLIC',
                description,
                companyId: (user as any).companyId
            }
        });

        return NextResponse.json(holiday);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
