import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth-legacy';

export async function GET(req: NextRequest) {
    try {
        const user = await getAuthenticatedUser();
        if (!user || !['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EDITOR'].includes(user.role)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const reviewers = await prisma.user.findMany({
            where: {
                role: { in: ['EDITOR', 'MANAGER', 'ADMIN', 'SUPER_ADMIN'] },
                isActive: true
            },
            select: {
                id: true,
                email: true,
                role: true,
                department: { select: { name: true } }
            }
        });

        return NextResponse.json(reviewers);

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
