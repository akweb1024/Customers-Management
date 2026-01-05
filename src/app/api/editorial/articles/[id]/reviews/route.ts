import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = await getAuthenticatedUser();
        const { id } = await params;

        if (!user || !['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EDITOR'].includes(user.role)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const reviews = await prisma.review.findMany({
            where: { articleId: id },
            include: {
                reviewer: {
                    select: { email: true, role: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(reviews);

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
