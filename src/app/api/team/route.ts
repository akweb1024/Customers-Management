import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        const authHeader = req.headers.get('authorization');
        const token = authHeader?.split(' ')[1];
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const decoded = verifyToken(token);
        if (!decoded || !['SUPER_ADMIN', 'MANAGER'].includes(decoded.role)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const team = await prisma.user.findMany({
            where: {
                role: { in: ['SALES_EXECUTIVE', 'FINANCE_ADMIN', 'MANAGER', 'SUPER_ADMIN'] }
            },
            select: {
                id: true,
                email: true,
                role: true,
                isActive: true,
                lastLogin: true,
                createdAt: true,
                _count: {
                    select: {
                        assignedSubscriptions: true,
                        tasks: { where: { status: 'PENDING' } }
                    }
                }
            }
        });

        return NextResponse.json(team);

    } catch (error: any) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
