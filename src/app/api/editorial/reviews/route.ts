import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        const user = await getAuthenticatedUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const reviews = await prisma.review.findMany({
            where: { reviewerId: user.id },
            include: {
                article: {
                    include: {
                        journal: { select: { name: true } },
                        authors: { select: { name: true } }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(reviews);

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
